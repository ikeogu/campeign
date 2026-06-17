<?php

namespace App\Modules\Shared\Services;

use App\Interfaces\PaymentGateWayInterface;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;

class WalletService
{

    public function __construct(
        public readonly PaymentGateWayInterface $paystackGatewayInterface
    ) {}

    public static function getWallet($userId)
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

        $wallet->decrement('balance', $amount);

        Transaction::create([
            'wallet_id' => $wallet->id,
            'type'      => 'debit',
            'amount'    => $amount,
            'narration' => $narration,
        ]);
    }

    public function walletTopup(int $amount): array
    {
        $user      = Auth::user();
        $reference = 'WAL-' . now()->format('YmdHisv') . random_int(100, 999);

        $transaction = Transaction::create([
            'wallet_id'   => $user->wallet->id,
            'amount'      => $amount * 100,
            'reference'   => $reference,
            'status'      => 'pending',
            'type'        => 'credit',
            'description' => 'Wallet Funding via OPay',
        ]);

        $response = $this->paystackGatewayInterface->payin([
            'email'        => $user->email,
            'userId'       => $user->id,
            'amount'       => $amount * 100,
            'reference'    => $reference,
            'callback_url' => url('/api/webhook/opay'),
        ]);

        // Store OPay's orderNo so we can query status later
        if (! empty($response['data']['orderNo'])) {
            $transaction->update([
                'metadata' => ['opay_order_no' => $response['data']['orderNo']],
            ]);
        }

        return $response;
    }
}