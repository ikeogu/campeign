<?php

namespace App\Http\Clients;

use App\Interfaces\PaymentGateWayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OpayClient implements PaymentGateWayInterface
{
    private string $baseUrl;
    private string $privateKey;
    private string $merchantId;
    private string $payoutPrivateKeyPath;
    private string $country = 'NG';

    public function __construct()
    {
        $this->baseUrl              = config('services.opay.base_url', 'https://testapi.opaycheckout.com');
        $this->privateKey           = config('services.opay.private_key', '');
        $this->merchantId           = config('services.opay.merchant_id', '');
        $this->payoutPrivateKeyPath = config('services.opay.payout_private_key_path');
    }

    /**
     * The Payout API (createSingleOrder, balance, bank-account-validate) signs
     * with RSA-SHA256 against a merchant-generated keypair — a different scheme
     * from the HMAC-SHA512 used by the checkout/payin/refund endpoints below,
     * which sign with the shared OPAY_PRIVATE_KEY secret instead.
     */
    private function signRsa(string $json): string
    {
        if (! is_readable($this->payoutPrivateKeyPath)) {
            throw new \RuntimeException("OPay payout: private key not found at {$this->payoutPrivateKeyPath}");
        }

        $key = openssl_pkey_get_private(file_get_contents($this->payoutPrivateKeyPath));

        if (! $key) {
            throw new \RuntimeException('OPay payout: could not load RSA private key (' . openssl_error_string() . ')');
        }

        openssl_sign($json, $binarySignature, $key, OPENSSL_ALGO_SHA256);

        return base64_encode($binarySignature);
    }

    private function request(string $path, array $payload, string $authMethod = 'hmac'): array
    {
        ksort($payload, SORT_STRING);
        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $signature = $authMethod === 'rsa'
            ? $this->signRsa($json)
            : hash_hmac('sha512', $json, $this->privateKey);

        Log::info("[OPay] POST {$path}", ['payload' => $payload, 'auth' => $authMethod]);

        // Send the exact bytes that were signed — letting Http::post() re-encode
        // the array itself would escape slashes differently and invalidate the
        // signature on OPay's end (confirmed via openssl_verify during testing).
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $signature,
            'MerchantId'    => $this->merchantId,
        ])->withBody($json, 'application/json')->post($this->baseUrl . $path);

        $body = $response->json() ?? [];

        Log::info("[OPay] {$path} response", [
            'http_status' => $response->status(),
            'body'        => $body,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                "OPay HTTP {$response->status()} on {$path}: "
                . ($body['message'] ?? $response->body() ?: 'no response body')
            );
        }

        return $body;
    }

    public function payin(array $data): array
    {
        $payload = [
            'amount'       => ['currency' => 'NGN', 'total' => (int) $data['amount']],
            'callbackUrl'  => $data['callback_url'],
            'country'      => $this->country,
            'customerName' => $data['email'],
            'payMethod'    => 'BankTransfer',
            'product'      => [
                'description' => 'Wallet Funding',
                'name'        => 'Wallet Top-up',
            ],
            'reference'    => $data['reference'],
            'userInfo'     => [
                'userEmail'  => $data['email'],
                'userId'     => (string) $data['userId'],
                'userMobile' => $data['phone'] ?? '',
                'userName'   => $data['email'],
            ],
        ];

        return $this->request('/api/v1/international/payment/create', $payload);
    }

    public function verifyTransaction(string $reference): array
    {
        $payload = [
            'country'   => $this->country,
            'reference' => $reference,
        ];

        return $this->request('/api/v1/international/cashier/status', $payload);
    }

    public function payout(array $data): array
    {
        // Payout API (createSingleOrder) — same host as checkout, but a
        // distinct product with its own path/payload shape and RSA-SHA256
        // auth. Endpoint, fields, and signing scheme sourced from OPay's
        // official "OPay-NG-payout" Postman collection.
        $payload = [
            'country'         => $this->country,
            'merchantOrderNo' => $data['reference'],
            'metaData'        => [
                'accountNo'       => $data['account_number'],
                'accountName'     => $data['account_name'],
                'accountBankCode' => $data['bank_code'],
            ],
            'amount'     => (int) $data['amount'],
            'currency'   => 'NGN',
            'payoutType' => 'BankTransfer',
            'notifyUrl'  => route('webhook-client-opay'),
            'language'   => 'en',
            'remark'     => $data['narration'] ?? 'Withdrawal',
        ];

        $body = $this->request('/api/v1/international/payout/createSingleOrder', $payload, authMethod: 'rsa');

        if (($body['code'] ?? '') !== '00000') {
            throw new \RuntimeException('OPay payout failed: ' . ($body['message'] ?? 'unknown error'));
        }

        return $body['data'] ?? [];
    }

    public function getBanks(): array
    {
        // Cache only successful live results — a transient failure shouldn't
        // lock the fallback list in for a full day.
        if ($cached = Cache::get('opay_bank_list')) {
            return $cached;
        }

        try {
            $body = $this->request('/api/v1/international/banks', [
                'countryCode' => $this->country,
            ], authMethod: 'rsa');
        } catch (\Throwable $e) {
            Log::warning('[OPay/Banks] Live bank list request failed, using static fallback', [
                'error' => $e->getMessage(),
            ]);
            return $this->staticBankFallback();
        }

        // Response shape wasn't confirmed against a real example — normalize
        // whichever key names OPay actually uses, and fall back if none match.
        $banks = collect($body['data'] ?? [])
            ->map(fn($bank) => [
                'name' => $bank['bankName'] ?? $bank['name'] ?? $bank['bank_name'] ?? null,
                'code' => $bank['bankCode'] ?? $bank['code'] ?? $bank['bank_code'] ?? null,
            ])
            ->filter(fn($bank) => $bank['name'] && $bank['code'])
            ->values();

        if ($banks->isEmpty()) {
            Log::warning('[OPay/Banks] Live response had no recognizable bank entries, using static fallback', [
                'body' => $body,
            ]);
            return $this->staticBankFallback();
        }

        $result = ['data' => $banks->all()];
        Cache::put('opay_bank_list', $result, now()->addDay());

        return $result;
    }

    /**
     * Covers all major Nigerian banks supported for transfers — used only if
     * the live /international/banks call fails or returns an unrecognized shape.
     */
    private function staticBankFallback(): array
    {
        return [
            'data' => [
                ['name' => 'Access Bank',                       'code' => '044'],
                ['name' => 'Carbon (One Finance)',              'code' => '565'],
                ['name' => 'Citibank Nigeria',                  'code' => '023'],
                ['name' => 'Ecobank Nigeria',                   'code' => '050'],
                ['name' => 'Fidelity Bank',                     'code' => '070'],
                ['name' => 'First Bank of Nigeria',             'code' => '011'],
                ['name' => 'First City Monument Bank (FCMB)',   'code' => '214'],
                ['name' => 'Guaranty Trust Bank (GTBank)',      'code' => '058'],
                ['name' => 'Heritage Bank',                     'code' => '030'],
                ['name' => 'Jaiz Bank',                         'code' => '301'],
                ['name' => 'Keystone Bank',                     'code' => '082'],
                ['name' => 'Kuda Bank',                         'code' => '50211'],
                ['name' => 'Moniepoint MFB',                    'code' => '50515'],
                ['name' => 'OPay',                              'code' => '999992'],
                ['name' => 'PalmPay',                           'code' => '999991'],
                ['name' => 'Polaris Bank',                      'code' => '076'],
                ['name' => 'Providus Bank',                     'code' => '101'],
                ['name' => 'Stanbic IBTC Bank',                 'code' => '221'],
                ['name' => 'Standard Chartered Bank',           'code' => '068'],
                ['name' => 'Sterling Bank',                     'code' => '232'],
                ['name' => 'Union Bank of Nigeria',             'code' => '032'],
                ['name' => 'United Bank for Africa (UBA)',      'code' => '033'],
                ['name' => 'Unity Bank',                        'code' => '215'],
                ['name' => 'VFD Microfinance Bank',             'code' => '566'],
                ['name' => 'Wema Bank',                         'code' => '035'],
                ['name' => 'Zenith Bank',                       'code' => '057'],
            ],
        ];
    }

    public function resolveAccountNumber(string $accountNumber, string $bankCode): array
    {
        $cacheKey = "bank_resolve_{$bankCode}_{$accountNumber}";

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($accountNumber, $bankCode) {
            try {
                $body = $this->request('/api/v1/international/payout/bank-account-validate', [
                    'accountBankCode' => $bankCode,
                    'accountNo'       => $accountNumber,
                ], authMethod: 'rsa');

                if (($body['code'] ?? '') === '00000') {
                    $data        = $body['data'] ?? [];
                    $accountName = $data['accountName'] ?? $data['account_name'] ?? $data['name'] ?? null;

                    if ($accountName) {
                        return [
                            'status' => true,
                            'data'   => [
                                'account_name'   => $accountName,
                                'account_number' => $accountNumber,
                            ],
                        ];
                    }
                }

                Log::warning('[OPay/Validate] Unrecognized response, falling back to Paystack', ['body' => $body]);
            } catch (\Throwable $e) {
                Log::warning('[OPay/Validate] Request failed, falling back to Paystack', ['error' => $e->getMessage()]);
            }

            return $this->resolveViaPaystack($accountNumber, $bankCode);
        });
    }

    private function resolveViaPaystack(string $accountNumber, string $bankCode): array
    {
        Log::info('[OPay/Resolve] Delegating account resolution to Paystack', [
            'account_number' => $accountNumber,
            'bank_code'      => $bankCode,
        ]);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.paystack.secret_key'),
        ])->get('https://api.paystack.co/bank/resolve', [
            'account_number' => $accountNumber,
            'bank_code'      => $bankCode,
        ]);

        return $response->json() ?? [];
    }

    public function checkBalance(): array
    {
        try {
            $body = $this->request('/api/v1/international/payout/balance', [
                'country'  => $this->country,
                'currency' => 'NGN',
                'type'     => 'CASH_ACCOUNT',
            ], authMethod: 'rsa');
        } catch (\Throwable $e) {
            // Fail open rather than blocking the whole withdrawal queue on a
            // balance-check error — payout() will still fail/retry per-transfer
            // if the account genuinely can't cover it.
            Log::warning('[OPay/Balance] Live balance check failed, treating as unconstrained', [
                'error' => $e->getMessage(),
            ]);
            return [['currency' => 'NGN', 'balance' => PHP_INT_MAX]];
        }

        $data = $body['data'] ?? [];

        // Confirmed real shape: {merchantId, country, balance: {total, currency}}
        // — balance itself is a nested object, not a scalar. Kept the looser
        // fallbacks below too, in case OPay's response varies by account/type.
        if (isset($data['balance']) && is_array($data['balance'])) {
            $data = [$data['balance']];
        } elseif (isset($data['currency']) || isset($data['balance'])) {
            $data = [$data];
        }

        $balances = collect($data)
            ->map(fn($b) => [
                'currency' => $b['currency'] ?? 'NGN',
                'balance'  => $b['total'] ?? $b['balance'] ?? $b['availableBalance'] ?? $b['amount'] ?? null,
            ])
            ->filter(fn($b) => is_numeric($b['balance']))
            ->values();

        if ($balances->isEmpty()) {
            Log::warning('[OPay/Balance] Live response had no recognizable balance, treating as unconstrained', [
                'body' => $body,
            ]);
            return [['currency' => 'NGN', 'balance' => PHP_INT_MAX]];
        }

        return $balances->all();
    }

    public function refund(array $data): array
    {
        return $this->request('/api/v1/international/refund', $data);
    }
}
