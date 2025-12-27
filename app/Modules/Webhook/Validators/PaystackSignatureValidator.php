<?php

namespace App\Modules\Webhook\Validators;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\WebhookClient\Exceptions\InvalidConfig;
use Spatie\WebhookClient\SignatureValidator\SignatureValidator;
use Spatie\WebhookClient\WebhookConfig;

class PaystackSignatureValidator implements SignatureValidator
{
  public function isValid(Request $request, WebhookConfig $config): bool
  {
    // Get the signature header name from config or use default
    $signatureHeaderName = $config->signatureHeaderName ?? 'x-paystack-signature';

    // Get the signature from headers
    $signature = $request->header($signatureHeaderName);

    // If no signature found, validation fails
    if (empty($signature)) {
      return false;
    }

    // Get the signing secret
    $signingSecret = $config->signingSecret;

    // Check if signing secret is set
    if (empty($signingSecret)) {
      throw InvalidConfig::signingSecretNotSet();
    }

    // Get raw payload
    $payload = $request->getContent();

    // Compute hash using the payload and secret
    $computedHash = hash_hmac('sha512', $payload, $signingSecret);

    // Compare the computed hash with the provided signature
    $isValid = hash_equals($computedHash, $signature);

    // Only log if validation fails
    if (!$isValid) {
      Log::error('Paystack Webhook Verification Failed', [
        'signature' => $signature,
        'computedHash' => $computedHash,
        'payload' => json_decode($payload, true)
      ]);
    }

    return $isValid;
  }
}