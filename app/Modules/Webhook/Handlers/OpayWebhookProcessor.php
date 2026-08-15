<?php

namespace App\Modules\Webhook\Handlers;

use App\Modules\Shared\Services\PaymentService;
use Illuminate\Support\Facades\Log;
use Spatie\WebhookClient\Jobs\ProcessWebhookJob;

class OpayWebhookProcessor extends ProcessWebhookJob
{
    public function handle(PaymentService $paymentService): void
    {
        $payload = $this->webhookCall->payload;
        Log::info('[OPay Webhook] Received', $payload);

        // Confirmed from a real delivery (2026-07-28): the actual event fields
        // are nested under a `payload` key, sibling to `sha512`/`type` — not
        // flat on the top-level body as originally assumed. Falling back to
        // the top level too in case some webhook variant sends it flat.
        $fields = $payload['payload'] ?? $payload;

        $status = $fields['status'] ?? null;
        // Payin/campaign-funding webhooks use 'reference'; payout webhooks may
        // echo back 'merchantOrderNo' instead (that's the field we sent it as
        // in OpayClient::payout()).
        $reference = $fields['reference'] ?? $fields['merchantOrderNo'] ?? null;

        if (! $reference) {
            Log::warning('[OPay Webhook] Missing reference in payload');
            return;
        }

        match (strtoupper((string) $status)) {
            'SUCCESS', 'SUCCESSFUL' => (function () use ($paymentService, $reference, $fields) {
                // Try all three — each is scoped to its own model/transaction
                // type and safely no-ops if the reference doesn't belong to
                // it, so it's safe to attempt all without knowing which
                // product the webhook came from.
                $paymentService->verifyPayment($reference, 'opay'); // wallet funding (WAL- credit)
                $paymentService->handleChargeSuccess(['reference' => $reference, 'data' => $fields]);
                $paymentService->handleTransferSuccess(['reference' => $reference, ...$fields]);
            })(),
            'FAIL', 'FAILED', 'CLOSE', 'REVERSED' => $paymentService->handleTransferFailed(['reference' => $reference, ...$fields]),
            default => Log::info('[OPay Webhook] Unhandled status', [
                'reference' => $reference,
                'status'    => $status,
            ]),
        };
    }
}
