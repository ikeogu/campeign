<?php


namespace App\Modules\Webhook\Handlers;

use App\Modules\Driver\Services\PayoutService;
use App\Modules\Shared\Services\PaymentService;
use Illuminate\Support\Facades\Log;
use Spatie\WebhookClient\Jobs\ProcessWebhookJob;

class PaystackWebhookProcessor extends ProcessWebhookJob
{

  public function handle(PaymentService $paymentService)
  {

    $data = $this->webhookCall->payload;
    Log::info('Paystack Webhook Received', $data);


    return match ($data['event']) {
    
      default =>  $paymentService->verifyPayment(
        $data['data']['reference'],
        $data['data']['channel'],
        $data['data']['created_at'],
        $data['data']['authorization']
      ),
    };
  }
}
