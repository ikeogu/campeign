<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class BackfillReferralCodes extends Command
{
    protected $signature   = 'users:backfill-referral-codes';
    protected $description = 'Assign a unique referral code to every user who does not already have one (accounts created before referral codes existed).';

    public function handle(): int
    {
        $users = User::whereNull('referral_code')->get();

        if ($users->isEmpty()) {
            $this->info('Every user already has a referral code.');
            return self::SUCCESS;
        }

        $this->info("Assigning referral codes to {$users->count()} user(s)...");

        foreach ($users as $user) {
            $user->update(['referral_code' => User::generateReferralCode()]);
            $this->line("  ✓ {$user->email} → {$user->referral_code}");
        }

        $this->info('Done.');
        return self::SUCCESS;
    }
}
