<?php

namespace App\Modules\Shared\Services;

use App\Models\Transaction;
use App\Models\Wallet;

class WalletService
{
    public function getWallet($userId)
    {
        return Wallet::firstOrCreate(['user_id' => $userId]);
    }

    public static function credit($userId, $amount, $narration, $metadata = [])
    {
        $wallet = self::getWallet($userId);

        $wallet->increment('balance', $amount);

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
}
