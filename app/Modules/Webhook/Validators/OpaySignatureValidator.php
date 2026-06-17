<?php

namespace App\Modules\Webhook\Validators;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\WebhookClient\SignatureValidator\SignatureValidator;
use Spatie\WebhookClient\WebhookConfig;

class OpaySignatureValidator implements SignatureValidator
{
    public function isValid(Request $request, WebhookConfig $config): bool
    {
        $payload = json_decode($request->getContent(), true);

        if (empty($payload)) {
            Log::error('[OPay Webhook] Empty or invalid JSON payload');
            return false;
        }

        $receivedSig = $payload['sha512'] ?? '';

        if (empty($receivedSig)) {
            Log::error('[OPay Webhook] Missing sha512 field in payload');
            return false;
        }

        $privateKey = $config->signingSecret;

        if (empty($privateKey)) {
            Log::error('[OPay Webhook] Signing secret not configured');
            return false;
        }

        // OPay signs a specific string of fields in a fixed order using HMAC-SHA3-512.
        // Refunded uses 't' for true and 'f' for false (not boolean).
        $amount        = $payload['amount']        ?? '';
        $currency      = $payload['currency']      ?? '';
        $reference     = $payload['reference']     ?? '';
        $refunded      = ($payload['refunded']     ?? false) ? 't' : 'f';
        $status        = $payload['status']        ?? '';
        $timestamp     = $payload['timestamp']     ?? '';
        $token         = $payload['token']         ?? '';
        $transactionId = $payload['transactionId'] ?? '';

        $sigString = "{Amount:\"{$amount}\",Currency:\"{$currency}\",Reference:\"{$reference}\","
            . "Refunded:{$refunded},Status:\"{$status}\",Timestamp:\"{$timestamp}\","
            . "Token:\"{$token}\",TransactionID:\"{$transactionId}\"}";

        $computed = hash_hmac('sha3-512', $sigString, $privateKey);
        $isValid  = hash_equals($computed, strtolower($receivedSig));

        if (! $isValid) {
            Log::error('[OPay Webhook] Signature mismatch', [
                'received'  => $receivedSig,
                'computed'  => $computed,
                'sigString' => $sigString,
            ]);
        }

        return $isValid;
    }
}
