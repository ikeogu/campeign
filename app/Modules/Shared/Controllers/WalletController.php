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
use Illuminate\Support\Str;
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

        $request->validate(['amount' => 'required|numeric|min:100']);
        $response = $this->walletService->walletTopup($request->amount);

        return Inertia::location($response['data']['authorization_url']);
    }

    public function withdraw()
    {

        $bankList = $this->paystackGatewayInterface->getBanks()['data'];

        return Inertia('Wallet/Withdraw', [
            'banks' => $bankList, // Array of ['name' => 'Access Bank', 'code' => '044']
            'wallet' => Auth::user()->wallet->balance / 100,
            'config' => [
                'min_withdrawal' => 1000,
                'transfer_fee' => 10,
                'currency' => 'NGN'
            ],
            'lastUsedAccount' => []
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
        $user = Auth::user();

        $request->validate([
            'amount' => 'required|numeric|min:100',
            'bank_code' => 'required',
            'account_number' => 'required|digits:10',
            'account_name' => 'required|string|max:100',
            'narration' => 'nullable|string|max:100', // Validate the new field
        ]);

        $percentage = config('app.transfer_fee');
        $grossAmount = $request->amount; // e.g., 1000

        // Calculations in Kobo for Paystack accuracy
        $grossKobo = $grossAmount * 100;

        // Compare in the same unit (kobo vs kobo)
        if ($user->wallet->balance < $grossKobo) {
            return back()->withErrors(['amount' => 'Insufficient wallet balance.']);
        }
        $feeKobo = (int) round(($grossKobo * $percentage) / 100);
        $netPayoutKobo = $grossKobo - $feeKobo; // What actually goes to their bank

        // Check platform Paystack balance before touching the user's wallet.
        try {
            $paystackBalances = $this->paystackGatewayInterface->checkBalance();
            $platformBalance  = collect($paystackBalances)->firstWhere('currency', 'NGN')['balance'] ?? 0;
        } catch (\Throwable $e) {
            Log::error('Paystack balance check failed', ['error' => $e->getMessage()]);
            $platformBalance = null;
        }

        if ($platformBalance !== null && $platformBalance < $netPayoutKobo) {
            $amountNaira   = number_format($netPayoutKobo / 100, 2);
            $currentNaira  = number_format($platformBalance / 100, 2);

            User::where('role', 'admin')->each(fn($admin) =>
                $admin->notify(new NotifyAnythingNotification(
                    'Low Paystack Balance — Withdrawal Blocked',
                    "A withdrawal of ₦{$amountNaira} requested by {$user->email} could not be processed.\n\n" .
                    "Platform Paystack NGN balance: ₦{$currentNaira}.\n\n" .
                    "Please top up the platform Paystack account to resume payouts."
                ))
            );

            Log::warning('Payout blocked: insufficient Paystack balance', [
                'user'              => $user->email,
                'requested_kobo'    => $netPayoutKobo,
                'platform_balance'  => $platformBalance,
            ]);

            return back()->withErrors([
                'amount' => "We can't process your withdrawal at the moment. Please try again later or contact support.",
            ]);
        }

        try {
            DB::transaction(function () use ($user, $grossKobo, $feeKobo, $netPayoutKobo, $request) {
                $reference = 'WD-' . now()->format('YmdHisv') . random_int(100, 999);

                // Lock the wallet row for the duration of this transaction to prevent
                // concurrent requests from passing the balance check simultaneously (TOCTOU).
                $wallet = $user->wallet()->lockForUpdate()->firstOrFail();

                if ($wallet->balance < $grossKobo) {
                    throw new \RuntimeException('Insufficient wallet balance.');
                }

                // 1. Deduct the FULL amount from user wallet
                $wallet->decrement('balance', $grossKobo);

                // 2. Record the transaction
                $wallet->transactions()->create([
                    'type' => 'debit',
                    'amount' => $grossKobo , // Total deducted in wallet
                    'description' => $request->narration ?? "Withdrawal to {$request->account_number}",
                    'status' => 'pending',
                    'reference' => $reference,
                    'metadata' => [
                        'bank_code' => $request->bank_code,
                        'account_number' => $request->account_number,
                        'fee' => $feeKobo / 100,
                        'net_payout' => $netPayoutKobo / 100,
                    ]
                ]);

                // 3. Trigger actual transfer: Send the NET amount to Paystack
                $this->paystackGatewayInterface->payout([
                    'amount' => $netPayoutKobo, // Paystack receives the amount minus the fee
                    'reference' => $reference,
                    'bank_code' => $request->bank_code,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                    'narration' => $request->narration ?? "Withdrawal from Wallet"
                ]);
            });

            return back()->with('message', 'Withdrawal initiated successfully!');
        } catch (\Exception $e) {
            Log::error("Payout Failed: " . $e->getMessage() . " at line " . $e->getLine());
            return back()->withErrors(['amount' => 'Payout failed: ' . $e->getMessage()]);
        }
    }

    public function handleGatewayCallback(Request $request)
    {
        $reference = $request->query('reference');
        try {
            $response = $this->paystackGatewayInterface->verifyTransaction($reference);
        } catch (\Exception $e) {
            Log::error("Payout Callback Failed: " . $e->getMessage() . " at line " . $e->getLine());
            return redirect()->route('wallet.index')
                ->with('error', 'Payout verification failed: ' . $e->getMessage());
        }

        if (!$response->json('status')) {
            return redirect()->route('wallet.index')
                ->with('error', 'Payout verification failed.');
        }

        // Update the transaction status based on the payout response
        $data = $response->json('data');

        $this->paymentService->verifyPayment($data['reference'], null);

        return redirect()->route('wallet.index')
            ->with('success', 'Payout status updated successfully.');
    }
}