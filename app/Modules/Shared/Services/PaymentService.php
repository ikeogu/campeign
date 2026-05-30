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


    public function verifyPayment(string $reference, ?string $channel): bool
    {
        info("I am here to verify");
        try {
            return DB::transaction(function () use ($reference) {
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
                    'channel' => 'paystack',
                    /*  'rave_reference' => $reference,
                    'channel' => $channel,
                    'card' => $card ?? [], */
                ]);

                if ($payment->type === 'credit') {
                    $payment->wallet->increment('balance', $payment->amount);

                    Log::info('Payment verified successfully', [
                        'payment_id' => $payment->id,
                        //'book_trip_id' => $bookedTrip->id,
                        'reference' => $reference
                    ]);

                    $payment->wallet->user->notify(new WalletFundedNotification($payment));
                }

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

    public function handleTransferSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            Log::warning('transfer.success webhook missing reference', ['data' => $data]);
            return;
        }

        Log::info('Handling transfer.success', ['reference' => $reference]);

        DB::transaction(function () use ($reference, $data) {
            // Accept both 'pending' and 'processing' to be idempotent against retries.
            $transaction = Transaction::where('reference', $reference)
                ->whereIn('status', ['pending', 'processing'])
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                Log::warning('transfer.success: transaction not found or already finalised', [
                    'reference' => $reference,
                ]);
                return;
            }

            $transaction->update([
                'status'   => 'successful',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'paystack_transfer_code' => $data['transfer_code'] ?? null,
                    'gateway_response'       => $data['gateway_response'] ?? 'Successful',
                    'transferred_at'         => $data['transferred_at'] ?? now(),
                ]),
            ]);

            Log::info('Withdrawal marked successful', [
                'reference'      => $reference,
                'transaction_id' => $transaction->id,
            ]);

            // Notify the wallet owner.
            $user = $transaction->wallet?->user;
            if ($user) {
                $netKobo    = $transaction->metadata['net_payout_kobo'] ?? $transaction->amount;
                $netNaira   = number_format($netKobo / 100, 2);
                $user->notify(new \App\Notifications\NotifyAnythingNotification(
                    'Withdrawal Successful',
                    "Your withdrawal of ₦{$netNaira} (ref: {$reference}) has been sent to your bank account successfully."
                ));
            }
        });
    }

    public function handleTransferFailed(array $data): void
    {
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            Log::warning('transfer.failed webhook missing reference', ['data' => $data]);
            return;
        }

        Log::warning('Handling transfer.failed/reversed', ['reference' => $reference]);

        DB::transaction(function () use ($reference, $data) {
            $transaction = Transaction::where('reference', $reference)
                ->whereIn('status', ['pending', 'processing'])
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                Log::warning('transfer.failed: transaction not found or already finalised', [
                    'reference' => $reference,
                ]);
                return;
            }

            // Mark the transaction as failed.
            $transaction->update([
                'status'   => 'failed',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'failure_reason'   => $data['reason'] ?? 'Transfer failed',
                    'gateway_response' => $data['gateway_response'] ?? null,
                    'failed_at'        => now()->toIso8601String(),
                ]),
            ]);

            // Refund the full gross amount back to the user's wallet.
            $grossKobo = (int) $transaction->amount;
            $wallet    = $transaction->wallet()->lockForUpdate()->first();

            if ($wallet) {
                $wallet->increment('balance', $grossKobo);

                $wallet->transactions()->create([
                    'type'        => 'credit',
                    'amount'      => $grossKobo,
                    'channel'     => 'refund',
                    'description' => "Refund for failed withdrawal (ref: {$reference})",
                    'status'      => 'successful',
                    'reference'   => 'RFND-' . $reference,
                    'metadata'    => ['original_reference' => $reference],
                ]);

                Log::info('Wallet refunded for failed transfer', [
                    'reference'   => $reference,
                    'gross_kobo'  => $grossKobo,
                    'wallet_id'   => $wallet->id,
                ]);

                // Notify the user.
                $user = $wallet->user;
                if ($user) {
                    $grossNaira = number_format($grossKobo / 100, 2);
                    $user->notify(new \App\Notifications\NotifyAnythingNotification(
                        'Withdrawal Failed — Funds Refunded',
                        "Your withdrawal of ₦{$grossNaira} (ref: {$reference}) could not be completed.\n\n" .
                        "The full amount has been refunded to your wallet. Please try again or contact support."
                    ));
                }
            }
        });
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

            /*  $payment->campaign->increment(
                'funded_amount',
                $payment->amount
            ); */

            $payment->campaign->update(['status' => 'live']);

            $payment->campaign->user->notify(new CampaignFundedNotification($payment->campaign));
        });
    }
}
