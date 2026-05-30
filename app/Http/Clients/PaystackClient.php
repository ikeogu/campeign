<?php

namespace App\Http\Clients;

use App\Interfaces\PaymentGateWayInterface;
use Illuminate\Http\Client\PendingRequest;
use App\Dtos\PaystackPayoutDto;
use Illuminate\Support\Facades\Log;

class PaystackClient extends PendingRequest implements PaymentGateWayInterface
{

    public function createRecipient(array $data)
    {
        $payload = [
            'type'           => 'nuban',
            'name'           => $data['account_name'],
            'account_number' => $data['account_number'],
            'bank_code'      => $data['bank_code'],
            'currency'       => 'NGN',
            'description'    => $data['narration'] ?? '',
            'metadata'       => ['reference' => $data['reference']],
        ];

        Log::info('[Paystack] POST transferrecipient', ['payload' => $payload]);

        $response = $this->post('transferrecipient', $payload);
        $body     = $response->json();

        Log::info('[Paystack] transferrecipient response', [
            'status'  => $response->status(),
            'body'    => $body,
        ]);

        if (!($body['status'] ?? false)) {
            throw new \RuntimeException(
                'Paystack createRecipient failed: ' . ($body['message'] ?? 'unknown error')
            );
        }

        return $body['data'] ?? null;
    }

    public function payout(array $data)
    {
        $recipient = $this->createRecipient($data);

        if (empty($recipient['recipient_code'])) {
            throw new \RuntimeException(
                'createRecipient returned no recipient_code. Response: ' . json_encode($recipient)
            );
        }

        $payload = [
            'source'    => 'balance',
            'amount'    => $data['amount'],
            'recipient' => $recipient['recipient_code'],
            'reason'    => $data['narration'] ?? 'Withdrawal',
            'currency'  => 'NGN',
            'reference' => $data['reference'],
            'metadata'  => ['reference' => $data['reference']],
        ];

        Log::info('[Paystack] POST transfer', ['payload' => $payload]);

        $response = $this->post('transfer', $payload);
        $body     = $response->json();

        Log::info('[Paystack] transfer response', [
            'status' => $response->status(),
            'body'   => $body,
        ]);

        if (!($body['status'] ?? false)) {
            throw new \RuntimeException(
                'Paystack transfer failed: ' . ($body['message'] ?? 'unknown error')
            );
        }

        return PaystackPayoutDto::fromArray($body['data']);
    }

    public function payin(array $data)
    {
        $response = $this->post('transaction/initialize', $data);
        return $response;
    }

    public function refund(array $data)
    {
        return $this->post('refund', $data);
    }

    public function getBanks()
    {
        $response = $this->get('bank?country=Nigeria');
        return $response->json();
    }

    public function resolveAccountNumber(string $accountNumber, string $bankCode)
    {
        Log::info('[Paystack] GET bank/resolve', [
            'account_number' => $accountNumber,
            'bank_code'      => $bankCode,
        ]);

        $response = $this->get("bank/resolve?account_number={$accountNumber}&bank_code={$bankCode}");
        $body     = $response->json();

        Log::info('[Paystack] bank/resolve response', [
            'status' => $response->status(),
            'body'   => $body,
        ]);

        return $body;
    }

    public function checkBalance()
    {
        $response = $this->get('balance');
        return $response->json('data');
    }

    public function verifyTransaction(string $reference)
    {
        $response = $this->get("transaction/verify/{$reference}");
        return $response;
    }
}
