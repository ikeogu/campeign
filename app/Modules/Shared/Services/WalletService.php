<?php

namespace App\Modules\Shared\Services;

use App\Interfaces\PaymentGateWayInterface;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WalletService
{

    public function __construct(
        public readonly PaymentGateWayInterface $paystackGatewayInterface
    ) {}
    
    public function getWallet($userId)
    {
        return Wallet::firstOrCreate(['user_id' => $userId]);
    }

    public static function credit($userId, $amount, $narration, $metadata = [])
    {
        $wallet = self::getWallet($userId);

        $wallet->increment('balance', $amount * 100);

        Transaction::create([
            'wallet_id' => $wallet->id,
            'type'      => 'credit',
            'amount'    => $amount,
            'narration' => $narration,
            'metadata'  => $metadata,
        ]);
    }

    public static function debit($userId, $amount, $narration)
    {
        $wallet = self::getWallet($userId);

        if ($wallet->balance < $amount) {
            throw new \Exception("Insufficient balance");
        }

        $wallet->decrement('balance', $amount * 100);

        Transaction::create([
            'wallet_id' => $wallet->id,
            'type'      => 'debit',
            'amount'    => $amount,
            'narration' => $narration,
        ]);
    }

    public function walletTopup(int $amount)
    {
        /** @var User $user */
        $user = Auth::user();
        // 1. Create unique reference
        $reference = 'WAL-' . strtoupper(Str::random(10));

        // 2. Save PENDING transaction in your DB
        Transaction::create([
            'wallet_id' => $user->wallet->id,
            'amount' => $amount * 100, // Convert to Kobo
            'reference' => $reference,
            'status' => 'pending',
            'type' => 'credit',
            'description' => 'Wallet Funding via Paystack'
        ]);

        $response = $this->paystackGatewayInterface->payin(
            [
                'email' => $user->email,
                'amount' => $amount * 100,
                'reference' => $reference,
                'callback_url' => route('handleGatewayCallbackWalletFunding'),
                'customizations' => [
                    'title' => 'GigsAndCampaigns',
                    'description' => 'Make money by sharing contents',
                    'logo' => 'https://assets.piedpiper.com/logo.png',
                ],
            ]
        );
        return $response;
    }
}
