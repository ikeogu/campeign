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

        $status    = $payload['status']    ?? null;
        $reference = $payload['reference'] ?? null;

        if (! $reference) {
            Log::warning('[OPay Webhook] Missing reference in payload');
            return;
        }

        match ($status) {
            'SUCCESS' => $paymentService->handleChargeSuccess([
                'reference' => $reference,
                'data'      => $payload,
            ]),
            'FAIL', 'CLOSE' => Log::warning('[OPay Webhook] Payment failed/closed', [
                'reference' => $reference,
                'status'    => $status,
            ]),
            default => Log::info('[OPay Webhook] Unhandled status', [
                'reference' => $reference,
                'status'    => $status,
            ]),
        };
    }
}
