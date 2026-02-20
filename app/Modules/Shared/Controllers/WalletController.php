<?php

namespace App\Modules\Shared\Controllers;

use App\Http\Controllers\ApiController;
use App\Interfaces\PaymentGateWayInterface;
use App\Modules\Shared\Services\PaymentService;
use App\Modules\Shared\Services\WalletService;
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
        public readonly PaymentGateWayInterface $paystackGatewayInterface
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
            'account_number' => ['required'],
            'bank_code' => ['required']
        ]);

        return $this->paystackGatewayInterface->resolveAccountNumber($request->account_number, $request->bank_code)['data'] ?? null;
    }

    public function payout(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'amount' => 'required|numeric|min:500',
            'bank_code' => 'required',
            'account_number' => 'required|digits:10',
            'account_name' => 'required|string|max:100',
            'narration' => 'nullable|string|max:100', // Validate the new field
        ]);

        $percentage = config('app.transfer_fee');
        $grossAmount = $request->amount; // e.g., 1000

        // Check balance: In the inclusive model, total deduction is just the grossAmount
        if ($user->wallet->balance < $grossAmount) {
            return back()->withErrors(['amount' => 'Insufficient wallet balance.']);
        }

        // Calculations in Kobo for Paystack accuracy
        $grossKobo = $grossAmount * 100;
        $feeKobo = (int) round(($grossAmount * $percentage) / 100);
        $netPayoutKobo = $grossKobo - $feeKobo; // What actually goes to their bank

        try {
            DB::transaction(function () use ($user, $grossAmount, $feeKobo, $netPayoutKobo, $request) {
                $reference = 'WD-' . strtoupper(Str::random(10));

                // 1. Deduct the FULL amount from user wallet
                $user->wallet->decrement('balance', $grossAmount);

                // 2. Record the transaction
                $user->wallet->transactions()->create([
                    'type' => 'debit',
                    'amount' => $grossAmount, // Total deducted
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
            return redirect()->route('wallet.index')
                ->with('error', 'Payment verification failed: ' . $e->getMessage());
        }
        if (!$response->json('status')) {
            return redirect()->route('wallet.index')
                ->with('error', 'Payment verification failed.');
        }

        app(PaymentService::class)->verifyPayment($response->json('data')['reference'], $response->json('data')['channel']);

        return redirect()->route('wallet.index')
            ->with('success', 'Wallet funded successfully.');
    }
}
