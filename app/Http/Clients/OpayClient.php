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
    private string $country = 'NG';

    public function __construct()
    {
        $this->baseUrl    = config('services.opay.base_url', 'https://testapi.opaycheckout.com');
        $this->privateKey = config('services.opay.private_key', '');
        $this->merchantId = config('services.opay.merchant_id', '');
    }

    private function sign(array $payload): string
    {
        ksort($payload, SORT_STRING);
        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        return hash_hmac('sha512', $json, $this->privateKey);
    }

    private function request(string $path, array $payload): array
    {
        ksort($payload, SORT_STRING);
        $signature = $this->sign($payload);

        Log::info("[OPay] POST {$path}", ['payload' => $payload]);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $signature,
            'MerchantId'    => $this->merchantId,
            'Content-Type'  => 'application/json',
        ])->post($this->baseUrl . $path, $payload);

        $body = $response->json() ?? [];

        Log::info("[OPay] {$path} response", [
            'http_status' => $response->status(),
            'body'        => $body,
        ]);

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
        $payload = [
            'amount'        => ['currency' => 'NGN', 'total' => (int) $data['amount']],
            'bankAccountNo' => $data['account_number'],
            'bankCode'      => $data['bank_code'],
            'beneficiary'   => ['name' => $data['account_name']],
            'country'       => $this->country,
            'reason'        => $data['narration'] ?? 'Withdrawal',
            'reference'     => $data['reference'],
        ];

        $body = $this->request('/api/v1/international/transfer/tobank', $payload);

        if (($body['code'] ?? '') !== '00000') {
            throw new \RuntimeException('OPay payout failed: ' . ($body['message'] ?? 'unknown error'));
        }

        return $body['data'] ?? [];
    }

    public function getBanks(): array
    {
        // OPay checkout does not expose a bank list endpoint.
        // This static list covers all major Nigerian banks supported for transfers.
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
        // OPay has no account enquiry endpoint — delegate to Paystack's free resolve API.
        $cacheKey = "bank_resolve_{$bankCode}_{$accountNumber}";

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($accountNumber, $bankCode) {
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
        });
    }

    public function checkBalance(): array
    {
        // OPay B2C does not require a pre-funded platform balance.
        // Return a sentinel value so the withdrawal queue is never gated on balance.
        return [['currency' => 'NGN', 'balance' => PHP_INT_MAX]];
    }

    public function refund(array $data): array
    {
        return $this->request('/api/v1/international/refund', $data);
    }
}
