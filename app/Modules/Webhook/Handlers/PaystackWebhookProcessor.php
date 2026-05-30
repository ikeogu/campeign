<?php


namespace App\Modules\Webhook\Handlers;

use App\Modules\Shared\Services\PaymentService;
use Illuminate\Support\Facades\Log;
use Spatie\WebhookClient\Jobs\ProcessWebhookJob;

class PaystackWebhookProcessor extends ProcessWebhookJob
{

    public function handle(PaymentService $paymentService)
    {
        $data = $this->webhookCall->payload;
        Log::info('Paystack Webhook Received', $data);

        match ($data['event']) {
            'charge.success'   => $paymentService->handleChargeSuccess($data),
            'transfer.success' => $paymentService->handleTransferSuccess($data['data']),
            'transfer.failed',
            'transfer.reversed' => $paymentService->handleTransferFailed($data['data']),
            default => Log::info('Paystack webhook event ignored', ['event' => $data['event']]),
        };
    }
}
