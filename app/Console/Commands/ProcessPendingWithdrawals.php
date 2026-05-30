<?php

namespace App\Console\Commands;

use App\Interfaces\PaymentGateWayInterface;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessPendingWithdrawals extends Command
{
    protected $signature   = 'withdrawals:process-pending';
    protected $description = 'Retry pending withdrawal transactions when the Paystack platform balance is sufficient.';

    public function __construct(protected readonly PaymentGateWayInterface $paystack)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        // Find all pending withdrawal transactions that have the required metadata.
        // We skip transactions created in the last 2 minutes to avoid racing with
        // a request that is still in-flight (just submitted).
        $pending = Transaction::query()
            ->where('type',    'debit')
            ->where('status',  'pending')
            ->where('channel', 'withdrawal')
            ->where('created_at', '<=', now()->subMinutes(2))
            ->orderBy('created_at')
            ->get();

        if ($pending->isEmpty()) {
            $this->info('No pending withdrawals found.');
            Log::info('[ProcessPendingWithdrawals] No pending withdrawals.');
            return self::SUCCESS;
        }

        $this->info("Found {$pending->count()} pending withdrawal(s). Checking Paystack balance...");
        Log::info("[ProcessPendingWithdrawals] Found {$pending->count()} pending withdrawal(s).");

        // ── Check platform Paystack balance once for the whole batch.
        try {
            $balances        = $this->paystack->checkBalance();
            $platformBalance = collect($balances)->firstWhere('currency', 'NGN')['balance'] ?? 0;
        } catch (\Throwable $e) {
            $this->error('Could not retrieve Paystack balance: ' . $e->getMessage());
            Log::error('[ProcessPendingWithdrawals] Balance check failed', ['error' => $e->getMessage()]);
            return self::FAILURE;
        }

        Log::info('[ProcessPendingWithdrawals] Platform NGN balance', [
            'balance_kobo' => $platformBalance,
            'balance_naira'=> number_format($platformBalance / 100, 2),
        ]);

        $this->info('Platform NGN balance: ₦' . number_format($platformBalance / 100, 2));

        $processed = 0;
        $skipped   = 0;

        foreach ($pending as $transaction) {
            $meta          = $transaction->metadata ?? [];
            $netPayoutKobo = (int) ($meta['net_payout_kobo'] ?? 0);
            $accountName   = $meta['account_name']   ?? null;
            $accountNumber = $meta['account_number'] ?? null;
            $bankCode      = $meta['bank_code']      ?? null;
            $narration     = $meta['narration']      ?? 'Withdrawal from Wallet';

            // Skip if metadata is incomplete — cannot reconstruct the transfer.
            if (! $netPayoutKobo || ! $accountName || ! $accountNumber || ! $bankCode) {
                Log::warning('[ProcessPendingWithdrawals] Skipping transaction: incomplete metadata', [
                    'transaction_id' => $transaction->id,
                    'reference'      => $transaction->reference,
                    'metadata'       => $meta,
                ]);
                $this->warn("  Skipped {$transaction->reference}: incomplete metadata.");
                $skipped++;
                continue;
            }

            // Not enough platform balance to cover this withdrawal — leave pending.
            if ($platformBalance < $netPayoutKobo) {
                Log::warning('[ProcessPendingWithdrawals] Insufficient Paystack balance for transaction', [
                    'reference'       => $transaction->reference,
                    'required_kobo'   => $netPayoutKobo,
                    'available_kobo'  => $platformBalance,
                ]);
                $this->warn("  Skipped {$transaction->reference}: platform balance insufficient (need ₦"
                    . number_format($netPayoutKobo / 100, 2)
                    . ', have ₦' . number_format($platformBalance / 100, 2) . ').');
                $skipped++;
                continue;
            }

            // ── Dispatch the transfer.
            try {
                Log::info('[ProcessPendingWithdrawals] Dispatching transfer', [
                    'reference'  => $transaction->reference,
                    'net_kobo'   => $netPayoutKobo,
                    'bank_code'  => $bankCode,
                    'account'    => $accountNumber,
                ]);

                $result = $this->paystack->payout([
                    'amount'         => $netPayoutKobo,
                    'reference'      => $transaction->reference,
                    'bank_code'      => $bankCode,
                    'account_number' => $accountNumber,
                    'account_name'   => $accountName,
                    'narration'      => $narration,
                ]);

                // Mark as processing — awaiting Paystack webhook confirmation.
                $transaction->update(['status' => 'processing']);

                // Deduct from our running tally so subsequent transactions in this
                // batch don't over-commit against the current platform balance.
                $platformBalance -= $netPayoutKobo;

                Log::info('[ProcessPendingWithdrawals] Transfer dispatched', [
                    'reference' => $transaction->reference,
                    'result'    => (array) $result,
                ]);

                $this->info("  ✓ Processed {$transaction->reference} (₦" . number_format($netPayoutKobo / 100, 2) . ').');
                $processed++;

                // Notify the wallet owner.
                $user = $transaction->wallet?->user;
                if ($user) {
                    $user->notify(new NotifyAnythingNotification(
                        'Withdrawal Processing',
                        "Your withdrawal of ₦" . number_format($netPayoutKobo / 100, 2) .
                        " (ref: {$transaction->reference}) is now being processed and will arrive shortly."
                    ));
                }

            } catch (\Throwable $e) {
                Log::error('[ProcessPendingWithdrawals] Transfer dispatch failed', [
                    'reference' => $transaction->reference,
                    'error'     => $e->getMessage(),
                    'class'     => get_class($e),
                ]);
                $this->error("  ✗ Failed {$transaction->reference}: " . $e->getMessage());
                $skipped++;
            }
        }

        $summary = "Done. Processed: {$processed} | Skipped/failed: {$skipped}.";
        $this->info($summary);
        Log::info("[ProcessPendingWithdrawals] {$summary}");

        // Alert admins if there are still skipped transactions (likely low balance).
        if ($skipped > 0) {
            User::where('role', 'admin')->each(fn($admin) =>
                $admin->notify(new NotifyAnythingNotification(
                    'Pending Withdrawals Still Queued',
                    "{$skipped} withdrawal(s) could not be processed (insufficient Paystack balance or bad metadata).\n\n" .
                    "Processed: {$processed}.\n\n" .
                    "Platform NGN balance remaining: ₦" . number_format($platformBalance / 100, 2) . ".\n\n" .
                    "Top up the Paystack account to unblock the queue."
                ))
            );
        }

        return self::SUCCESS;
    }
}
