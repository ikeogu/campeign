<?php

namespace App\Console\Commands;

use App\Interfaces\PaymentGateWayInterface;
use App\Models\Transaction;
use App\Models\User;
use App\Modules\Shared\Services\PaymentService;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessPendingWithdrawals extends Command
{
    protected $signature   = 'withdrawals:process-pending';
    protected $description = 'Process pending credit (wallet funding) and debit (withdrawal) transactions.';

    public function __construct(
        protected readonly PaymentGateWayInterface $paystack,
        protected readonly PaymentService $paymentService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->line('');
        $this->info('── Processing pending credits (wallet funding) ──────────────');
        $this->processPendingCredits();

        $this->line('');
        $this->info('── Processing pending debits (withdrawals) ──────────────────');
        $this->processPendingDebits();

        $this->line('');
        return self::SUCCESS;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREDITS — pending wallet top-ups waiting for Paystack confirmation
    // ─────────────────────────────────────────────────────────────────────────
    private function processPendingCredits(): void
    {
        // Give Paystack at least 5 minutes before we check; freshly created
        // transactions may still be processing on their end.
        $pending = Transaction::query()
            ->where('type',   'credit')
            ->where('status', 'pending')
            ->where('created_at', '<=', now()->subMinutes(5))
            ->orderBy('created_at')
            ->get();

        if ($pending->isEmpty()) {
            $this->info('No pending credits found.');
            return;
        }

        $this->info("Found {$pending->count()} pending credit(s). Verifying with Paystack...");
        Log::info('[ProcessPendingWithdrawals:credits] Found ' . $pending->count() . ' pending credit(s).');

        $completed = 0;
        $skipped   = 0;

        foreach ($pending as $transaction) {
            try {
                Log::info('[ProcessPendingWithdrawals:credits] Verifying', [
                    'reference' => $transaction->reference,
                ]);

                $response = $this->paystack->verifyTransaction($transaction->reference);
                $body     = $response->json();

                $paystackStatus = $body['data']['status'] ?? null;

                Log::info('[ProcessPendingWithdrawals:credits] Paystack verify response', [
                    'reference'       => $transaction->reference,
                    'paystack_status' => $paystackStatus,
                    'http_status'     => $response->status(),
                ]);

                if ($paystackStatus === 'success') {
                    // Complete the wallet funding — credits wallet + notifies user.
                    $done = $this->paymentService->verifyPayment($transaction->reference, 'paystack');

                    if ($done) {
                        $amountNaira = number_format($transaction->amount / 100, 2);
                        $this->info("  ✓ Funded {$transaction->reference} (₦{$amountNaira}).");
                        $completed++;
                    } else {
                        $this->warn("  ~ {$transaction->reference}: verifyPayment returned false (already processed?).");
                        $skipped++;
                    }

                } elseif (in_array($paystackStatus, ['failed', 'abandoned', 'reversed'])) {
                    $transaction->update(['status' => 'failed']);
                    $this->warn("  ✗ {$transaction->reference}: Paystack status is '{$paystackStatus}'. Marked failed.");
                    Log::warning('[ProcessPendingWithdrawals:credits] Payment failed on Paystack', [
                        'reference'       => $transaction->reference,
                        'paystack_status' => $paystackStatus,
                    ]);
                    $skipped++;

                } else {
                    // Still pending on Paystack — leave it.
                    $this->line("  · {$transaction->reference}: still '{$paystackStatus}' on Paystack. Leaving pending.");
                    $skipped++;
                }

            } catch (\Throwable $e) {
                Log::error('[ProcessPendingWithdrawals:credits] Verification error', [
                    'reference' => $transaction->reference,
                    'error'     => $e->getMessage(),
                ]);
                $this->error("  ✗ {$transaction->reference}: " . $e->getMessage());
                $skipped++;
            }
        }

        $this->info("Credits done. Completed: {$completed} | Skipped/failed: {$skipped}.");
        Log::info('[ProcessPendingWithdrawals:credits] Done.', compact('completed', 'skipped'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEBITS — pending withdrawals waiting for sufficient Paystack balance
    // ─────────────────────────────────────────────────────────────────────────
    private function processPendingDebits(): void
    {
        $pending = Transaction::query()
            ->where('type',    'debit')
            ->where('status',  'pending')
            ->where('channel', 'withdrawal')
            ->where('created_at', '<=', now()->subMinutes(2))
            ->orderBy('created_at')
            ->get();

        if ($pending->isEmpty()) {
            $this->info('No pending withdrawals found.');
            return;
        }

        $this->info("Found {$pending->count()} pending withdrawal(s). Checking Paystack balance...");
        Log::info('[ProcessPendingWithdrawals:debits] Found ' . $pending->count() . ' pending withdrawal(s).');

        // Check platform balance once for the whole batch.
        try {
            $balances        = $this->paystack->checkBalance();
            $platformBalance = collect($balances)->firstWhere('currency', 'NGN')['balance'] ?? 0;
        } catch (\Throwable $e) {
            $this->error('Could not retrieve Paystack balance: ' . $e->getMessage());
            Log::error('[ProcessPendingWithdrawals:debits] Balance check failed', ['error' => $e->getMessage()]);
            return;
        }

        $this->info('Platform NGN balance: ₦' . number_format($platformBalance / 100, 2));
        Log::info('[ProcessPendingWithdrawals:debits] Platform balance', [
            'balance_kobo'  => $platformBalance,
            'balance_naira' => number_format($platformBalance / 100, 2),
        ]);

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
                Log::warning('[ProcessPendingWithdrawals:debits] Incomplete metadata', [
                    'reference' => $transaction->reference,
                    'metadata'  => $meta,
                ]);
                $this->warn("  Skipped {$transaction->reference}: incomplete metadata.");
                $skipped++;
                continue;
            }

            // Not enough platform balance — leave pending.
            if ($platformBalance < $netPayoutKobo) {
                $this->warn("  Skipped {$transaction->reference}: need ₦"
                    . number_format($netPayoutKobo / 100, 2)
                    . ', have ₦' . number_format($platformBalance / 100, 2) . '.');
                Log::warning('[ProcessPendingWithdrawals:debits] Insufficient Paystack balance', [
                    'reference'      => $transaction->reference,
                    'required_kobo'  => $netPayoutKobo,
                    'available_kobo' => $platformBalance,
                ]);
                $skipped++;
                continue;
            }

            // Dispatch the transfer.
            try {
                Log::info('[ProcessPendingWithdrawals:debits] Dispatching transfer', [
                    'reference' => $transaction->reference,
                    'net_kobo'  => $netPayoutKobo,
                    'bank_code' => $bankCode,
                    'account'   => $accountNumber,
                ]);

                $result = $this->paystack->payout([
                    'amount'         => $netPayoutKobo,
                    'reference'      => $transaction->reference,
                    'bank_code'      => $bankCode,
                    'account_number' => $accountNumber,
                    'account_name'   => $accountName,
                    'narration'      => $narration,
                ]);

                $transaction->update(['status' => 'processing']);

                // Track running balance so we don't over-commit within this batch.
                $platformBalance -= $netPayoutKobo;

                Log::info('[ProcessPendingWithdrawals:debits] Dispatched', [
                    'reference' => $transaction->reference,
                    'result'    => (array) $result,
                ]);

                $this->info("  ✓ Dispatched {$transaction->reference} (₦" . number_format($netPayoutKobo / 100, 2) . ').');
                $processed++;

                $user = $transaction->wallet?->user;
                if ($user) {
                    $user->notify(new NotifyAnythingNotification(
                        'Withdrawal Processing',
                        "Your withdrawal of ₦" . number_format($netPayoutKobo / 100, 2) .
                        " (ref: {$transaction->reference}) is now being processed and will arrive shortly."
                    ));
                }

            } catch (\Throwable $e) {
                Log::error('[ProcessPendingWithdrawals:debits] Dispatch failed', [
                    'reference' => $transaction->reference,
                    'error'     => $e->getMessage(),
                    'class'     => get_class($e),
                ]);
                $this->error("  ✗ Failed {$transaction->reference}: " . $e->getMessage());
                $skipped++;
            }
        }

        $this->info("Withdrawals done. Dispatched: {$processed} | Skipped/failed: {$skipped}.");
        Log::info('[ProcessPendingWithdrawals:debits] Done.', compact('processed', 'skipped'));

        // Alert admins if there are still queued transactions.
        if ($skipped > 0) {
            User::where('role', 'admin')->each(fn($admin) =>
                $admin->notify(new NotifyAnythingNotification(
                    'Pending Withdrawals Still Queued',
                    "{$skipped} withdrawal(s) could not be processed.\n\n" .
                    "Dispatched: {$processed}.\n\n" .
                    "Platform NGN balance remaining: ₦" . number_format($platformBalance / 100, 2) . ".\n\n" .
                    "Top up the Paystack account to unblock the queue."
                ))
            );
        }
    }
}
