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

        $status = $payload['status'] ?? $payload['data']['status'] ?? null;
        // Payin/campaign-funding webhooks use 'reference'; payout webhooks may
        // echo back 'merchantOrderNo' instead (that's the field we sent it as
        // in OpayClient::payout() — the real webhook shape isn't confirmed yet).
        $reference = $payload['reference'] ?? $payload['merchantOrderNo'] ?? null;

        if (! $reference) {
            Log::warning('[OPay Webhook] Missing reference in payload');
            return;
        }

        match ($status) {
            'SUCCESS' => (function () use ($paymentService, $reference, $payload) {
                // Try both — each is scoped to its own model/transaction type
                // and safely no-ops if the reference doesn't belong to it, so
                // it's safe to attempt both without knowing which product the
                // webhook came from.
                $paymentService->handleChargeSuccess(['reference' => $reference, 'data' => $payload]);
                $paymentService->handleTransferSuccess(['reference' => $reference, ...$payload]);
            })(),
            'FAIL', 'CLOSE' => $paymentService->handleTransferFailed(['reference' => $reference, ...$payload]),
            default => Log::info('[OPay Webhook] Unhandled status', [
                'reference' => $reference,
                'status'    => $status,
            ]),
        };
    }
}
