<?php

namespace App\Modules\Shared\Controllers;

use App\Http\Controllers\ApiController;
use App\Interfaces\PaymentGateWayInterface;
use App\Modules\Shared\Services\PaymentService;
use App\Modules\Shared\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'wallet' => Auth::user()->wallet->balance,
            'config' => [
                'min_withdrawal' => 1000,
                'transfer_fee' => 25,
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
            'account_number' => ['required'],
            'name' => ['required'],
            'bank_name' => ['required'],
            'bank_code' => ['required'],
            "currency" => "NGN"
        ]);

        if ($user->wallet->balance < $request->amount) {
            return back()->withErrors(['amount' => 'Insufficient funds']);
        }


        $response = $this->paystackGatewayInterface->payout($request->all());

        return back()->with(['response' => $response, 'success' => true]);
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
