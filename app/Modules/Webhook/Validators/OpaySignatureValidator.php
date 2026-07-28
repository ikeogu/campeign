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

        // This validator's HMAC-SHA3-512-over-body scheme is confirmed correct
        // for payin/checkout webhooks only. Payout webhooks are a different
        // OPay product with an unconfirmed shape — logging headers too, since
        // the payout API signs outbound requests via an Authorization header,
        // so an incoming payout webhook signature may live there instead of
        // in the body like the payin 'sha512' field does.
        Log::info('[OPay Webhook] Signature check', [
            'headers' => $request->headers->all(),
            'payload' => $payload,
        ]);

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

        // Confirmed from a real delivery (2026-07-28): the actual event fields
        // are nested under a `payload` key, sibling to `sha512` and `type` —
        // not flat on the top-level body as originally assumed. Falling back
        // to the top level too in case some webhook variant sends it flat.
        $fields = $payload['payload'] ?? $payload;

        // OPay signs a specific string of fields in a fixed order using HMAC-SHA3-512.
        // Refunded uses 't' for true and 'f' for false (not boolean).
        $amount        = $fields['amount']        ?? '';
        $currency      = $fields['currency']      ?? '';
        $reference     = $fields['reference']     ?? '';
        $refunded      = ($fields['refunded']     ?? false) ? 't' : 'f';
        $status        = $fields['status']        ?? '';
        $timestamp     = $fields['timestamp']     ?? '';
        $token         = $fields['token']         ?? '';
        $transactionId = $fields['transactionId'] ?? '';

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
