<?php

namespace App\Modules\Shared\Services;

use App\Interfaces\PaymentGateWayInterface;
use App\Models\CampaignPayment;
use App\Models\Transaction;
use App\Modules\Campeigner\Notifications\CampaignFundedNotification;
use App\Modules\Shared\Notifications\WalletFundedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{

    public function __construct(
        protected readonly PaymentGateWayInterface $paymentGateWayInterface,
    ) {}

    public function getBankList()
    {
        return $this->paymentGateWayInterface->getBanks();
    }


    public function verifyPayment(string $reference, string $channel): bool
    {
        info("I am here to verify");
        try {
            return DB::transaction(function () use ($reference, $channel) {
                $payment = Transaction::where('reference', $reference)
                    ->where('status', 'pending')
                    ->first();


                if (!$payment) {
                    Log::warning('Payment verification failed: Payment not found or not pending', [
                        'reference' => $reference
                    ]);
                    return false;
                }

                // Update payment status
                $payment->update([
                    'status' => 'successful',
                    'channel' => $channel,
                    /*  'rave_reference' => $reference,
                    'channel' => $channel,
                    'card' => $card ?? [], */
                ]);

                $payment->wallet->increment('balance', $payment->amount);

                Log::info('Payment verified successfully', [
                    'payment_id' => $payment->id,
                    //'book_trip_id' => $bookedTrip->id,
                    'reference' => $reference
                ]);

                $payment->wallet->user->notify(new WalletFundedNotification($payment));

                return true;
            });
        } catch (\Exception $e) {
            Log::error('Payment verification failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    public  function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            return;
        }

        $payment = CampaignPayment::where('reference', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$payment) {
            return; // idempotent safety
        }

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status'       => 'success',
                'paid_at'      => now(),
                'gateway_data' => $data,
            ]);

            $payment->campaign->increment(
                'funded_amount',
                $payment->amount
            );

            $payment->campaign->update(['status' => 'live']);

            $payment->campaign->user->notify(new CampaignFundedNotification($payment->campaign));
        });
    }
}
