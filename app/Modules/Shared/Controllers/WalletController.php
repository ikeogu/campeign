<?php

namespace App\Modules\Shared\Controllers;

use App\Http\Controllers\ApiController;
use App\Interfaces\PaymentGateWayInterface;
use App\Models\User;
use App\Modules\Shared\Services\PaymentService;
use App\Modules\Shared\Services\WalletService;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WalletController extends ApiController
{

    public function __construct(
        public readonly WalletService $walletService,
        public readonly PaymentGateWayInterface $paystackGatewayInterface,
        public readonly PaymentService $paymentService
    ) {}

    public function index()
    {
        $wallet = $this->walletService->getWallet(Auth::id());

        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return inertia('Wallet/Index', [
            'wallet' => $wallet->balance / 100,
            'transactions' => $transactions
        ]);
    }

    public function fundWallet()
    {
        return inertia('Wallet/Fund');
    }

    public function initialize(Request $request)
    {
        $minAmount = app()->isProduction() ? 100 : 1;
        $request->validate(['amount' => "required|numeric|min:{$minAmount}"]);

        $response = $this->walletService->walletTopup($request->amount);

        if (($response['code'] ?? '') !== '00000') {
            return back()->withErrors([
                'amount' => $response['message'] ?? 'Payment initialization failed. Please try again.',
            ]);
        }

        $data       = $response['data'] ?? [];
        $nextAction = $data['nextAction'] ?? [];

        return back()->with('opay_payment', [
            'bank_account' => $nextAction['transferAccountNumber'] ?? null,
            'bank_name'    => $nextAction['transferBankName'] ?? 'OPay Digital Services',
            'amount'       => $request->amount,
            'reference'    => $data['reference'] ?? null,
            'order_no'     => $data['orderNo'] ?? null,
            'expires_at'   => isset($nextAction['expiredTimestamp'])
                ? date('d M Y, H:i', (int) $nextAction['expiredTimestamp'])
                : null,
        ]);
    }

    public function withdraw()
    {
        $user         = Auth::user()->load(['kyc', 'payoutAccount']);
        $isCampaigner = $user->role === 'campaigner';

        $withdrawalCount = $user->role === 'promoter'
            ? $user->wallet->transactions()
                ->where('type', 'debit')
                ->where('channel', 'withdrawal')
                ->whereNotIn('status', ['reversed'])
                ->count()
            : 0;

        return Inertia('Wallet/Withdraw', [
            'banks'            => $this->paystackGatewayInterface->getBanks()['data'],
            'wallet'           => $user->wallet->balance / 100,
            'config'           => [
                'min_withdrawal' => 1000,
                'transfer_fee'   => 10,
                'currency'       => 'NGN',
            ],
            'kyc_status'       => $user->kyc?->status,
            'user_role'        => $user->role,
            'payout_account'   => $isCampaigner ? $user->payoutAccount : null,
            'withdrawal_count' => $withdrawalCount,
        ]);
    }

    public function resolveBank(Request $request)
    {
        $request->validate([
            'account_number' => ['required', 'digits:10'],
            'bank_code'      => ['required', 'string'],
        ]);

        try {
            $result = $this->paystackGatewayInterface->resolveAccountNumber(
                $request->account_number,
                $request->bank_code
            );

            if (!empty($result['status']) && !empty($result['data']['account_name'])) {
                return response()->json([
                    'account_name'   => $result['data']['account_name'],
                    'account_number' => $result['data']['account_number'] ?? $request->account_number,
                ]);
            }

            return response()->json([
                'error' => $result['message'] ?? 'Could not verify account. Check account number and bank.',
            ], 422);

        } catch (\Throwable $e) {
            Log::error('Bank resolve failed', [
                'account_number' => $request->account_number,
                'bank_code'      => $request->bank_code,
                'error'          => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Verification service unavailable. Please try again.',
            ], 503);
        }
    }

    public function payout(Request $request)
    {
        /** @var User $user */
        $user = Auth::user()->load(['kyc', 'payoutAccount']);

        // ── Advertiser gate ───────────────────────────────────────────────────
        if ($user->role === 'campaigner') {
            if (! $user->kyc || $user->kyc->status !== 'approved') {
                return redirect()->route('kyc.show')
                    ->with('info', 'Complete identity verification before withdrawing.');
            }
            if (! $user->payoutAccount) {
                return redirect()->route('advertiser.payout-account')
                    ->with('info', 'Register your payout account before withdrawing.');
            }
            // Override form with saved, verified payout details — no user manipulation possible.
            $request->merge([
                'bank_code'      => $user->payoutAccount->bank_code,
                'bank_name'      => $user->payoutAccount->bank_name,
                'account_number' => $user->payoutAccount->account_number,
                'account_name'   => $user->payoutAccount->account_name,
            ]);
        }

        $request->validate([
            'amount'         => 'required|numeric|min:100',
            'bank_code'      => 'required',
            'account_number' => 'required|digits:10',
            'account_name'   => 'required|string|max:100',
            'narration'      => 'nullable|string|max:100',
        ]);

        // ── Promoter KYC gates ────────────────────────────────────────────────
        $grossKobo = (int) round((float) $request->amount * 100);
        if ($user->role === 'promoter') {
            $kycApproved = $user->kyc && $user->kyc->status === 'approved';

            // Count previous withdrawal attempts (excluding reversed ones)
            $previousWithdrawals = $user->wallet->transactions()
                ->where('type', 'debit')
                ->where('channel', 'withdrawal')
                ->whereNotIn('status', ['reversed'])
                ->count();

            $needsKyc = ! $kycApproved && (
                $grossKobo > 1_000_000        // above ₦10,000
                || $previousWithdrawals >= 2  // 3rd withdrawal or beyond
            );

            if ($needsKyc) {
                $reason = $previousWithdrawals >= 2
                    ? 'Identity verification is required from your 3rd withdrawal onwards.'
                    : 'Identity verification is required for withdrawals above ₦10,000.';

                return redirect()->route('kyc.show')->with('info', $reason . ' It only takes a minute.');
            }
        }

        $percentage    = (float) config('app.transfer_fee', 10);
        $feeKobo       = (int) round($grossKobo * $percentage / 100);
        $netPayoutKobo = $grossKobo - $feeKobo;

        Log::info('Payout initiated', [
            'user'            => $user->email,
            'gross_kobo'      => $grossKobo,
            'fee_kobo'        => $feeKobo,
            'net_payout_kobo' => $netPayoutKobo,
            'wallet_balance'  => $user->wallet->balance,
        ]);

        if ($user->wallet->balance < $grossKobo) {
            return back()->withErrors(['amount' => 'Insufficient wallet balance.']);
        }

        // ── Step 1: Debit wallet & create pending transaction atomically.
        // This happens BEFORE the Paystack call so the record always exists
        // for the retry command if the platform balance is insufficient.
        $transaction = null;

        try {
            DB::transaction(function () use ($user, $grossKobo, $feeKobo, $netPayoutKobo, $request, &$transaction) {
                $wallet = $user->wallet()->lockForUpdate()->firstOrFail();

                if ($wallet->balance < $grossKobo) {
                    throw new \RuntimeException('Insufficient wallet balance (race condition check).');
                }

                $wallet->decrement('balance', $grossKobo);

                $transaction = $wallet->transactions()->create([
                    'type'        => 'debit',
                    'amount'      => $grossKobo,
                    'channel'     => 'withdrawal',
                    'description' => $request->narration ?? "Withdrawal to {$request->account_number}",
                    'status'      => 'pending',
                    'reference'   => 'WD-' . now()->format('YmdHisv') . random_int(100, 999),
                    'metadata'    => [
                        'bank_code'       => $request->bank_code,
                        'bank_name'       => $request->bank_name ?? '',
                        'account_number'  => $request->account_number,
                        'account_name'    => $request->account_name,
                        'fee_kobo'        => $feeKobo,
                        'net_payout_kobo' => $netPayoutKobo,
                        'narration'       => $request->narration ?? 'Withdrawal from Wallet',
                    ],
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('Payout: wallet debit failed', [
                'user'    => $user->email,
                'message' => $e->getMessage(),
            ]);
            return back()->withErrors(['amount' => 'Could not process withdrawal: ' . $e->getMessage()]);
        }

        // Safety guard — should never be null here since the catch above returns early.
        if ($transaction === null) {
            Log::error('Payout: transaction was not created after DB block.', ['user' => $user->email]);
            return back()->withErrors(['amount' => 'Withdrawal could not be recorded. Please try again.']);
        }

        // ── Step 2: Check platform Paystack balance.
        try {
            $paystackBalances = $this->paystackGatewayInterface->checkBalance();
            Log::info('Paystack platform balance', ['balances' => $paystackBalances]);
            $platformBalance = collect($paystackBalances)->firstWhere('currency', 'NGN')['balance'] ?? 0;
        } catch (\Throwable $e) {
            Log::error('Paystack balance check failed', ['error' => $e->getMessage()]);
            $platformBalance = null;
        }

        if ($platformBalance !== null && $platformBalance < $netPayoutKobo) {
            // Wallet is already debited. Leave the transaction pending — the
            // ProcessPendingWithdrawals command will retry it when balance is topped up.
            $amountNaira  = number_format($netPayoutKobo / 100, 2);
            $currentNaira = number_format($platformBalance / 100, 2);

            User::where('role', 'admin')->each(fn($admin) =>
                $admin->notify(new NotifyAnythingNotification(
                    'Low Paystack Balance — Withdrawal Queued',
                    "A withdrawal of ₦{$amountNaira} by {$user->email} was queued (pending).\n\n" .
                    "Platform NGN balance: ₦{$currentNaira}.\n\n" .
                    "The withdrawal will be auto-processed once the balance is topped up."
                ))
            );

            Log::warning('Payout queued: insufficient Paystack balance', [
                'user'            => $user->email,
                'transaction_ref' => $transaction->reference,
                'required_kobo'   => $netPayoutKobo,
                'platform_kobo'   => $platformBalance,
            ]);

            return redirect()->route('withdraw.create')->with('message',
                'Your withdrawal request has been queued and will be processed automatically once our payment processor is ready. Your wallet has been debited.'
            );
        }

        // ── Step 3: Dispatch the transfer to Paystack immediately.
        try {
            Log::info('Dispatching Paystack transfer', [
                'reference' => $transaction->reference,
                'net_kobo'  => $netPayoutKobo,
            ]);

            $result = $this->paystackGatewayInterface->payout([
                'amount'         => $netPayoutKobo,
                'reference'      => $transaction->reference,
                'bank_code'      => $request->bank_code,
                'account_number' => $request->account_number,
                'account_name'   => $request->account_name,
                'narration'      => $request->narration ?? 'Withdrawal from Wallet',
            ]);

            // Mark as dispatched — awaiting Paystack webhook confirmation.
            $transaction->update(['status' => 'processing']);

            Log::info('Paystack transfer dispatched', [
                'reference' => $transaction->reference,
                'result'    => (array) $result,
            ]);

            return redirect()->route('withdraw.create')->with('message', 'Withdrawal initiated successfully! You will receive your funds shortly.');

        } catch (\Throwable $e) {
            // Paystack call failed for a reason other than balance — log it.
            // The transaction stays pending so the retry command can attempt it again.
            Log::error('Paystack transfer dispatch failed', [
                'user'      => $user->email,
                'reference' => $transaction->reference,
                'message'   => $e->getMessage(),
                'class'     => get_class($e),
            ]);

            return redirect()->route('withdraw.create')->with('message',
                'Your withdrawal has been queued and will be retried automatically. Your wallet has been debited.'
            );
        }
    }

    public function handleGatewayCallback(Request $request)
    {
        $reference = $request->query('reference');

        if (! $reference) {
            return redirect()->route('wallet.index')->with('error', 'Missing payment reference.');
        }

        try {
            $response = $this->paystackGatewayInterface->verifyTransaction($reference);
        } catch (\Exception $e) {
            Log::error('[OPay] Callback verification failed', ['error' => $e->getMessage()]);
            return redirect()->route('wallet.index')
                ->with('error', 'Payment verification failed. Please contact support.');
        }

        $status = $response['data']['status'] ?? null;

        if ($status === 'SUCCESS') {
            $this->paymentService->verifyPayment($reference, 'opay');
            return redirect()->route('wallet.index')->with('success', 'Payment verified successfully.');
        }

        if (in_array($status, ['FAIL', 'CLOSE'])) {
            return redirect()->route('wallet.index')->with('error', 'Payment was not successful.');
        }

        // PENDING / INITIAL — payment not yet confirmed
        return redirect()->route('wallet-fund')
            ->with('info', 'Payment is still pending. Please complete the bank transfer and check back shortly.');
    }
}