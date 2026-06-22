<?php

namespace Database\Seeders;

use App\Models\KycVerification;
use App\Models\User;
use App\Models\UserPayoutAccount;
use Illuminate\Database\Seeder;

class KycVerificationSeeder extends Seeder
{
    /**
     * Seeds KYC verifications and (for advertisers) payout accounts for all
     * existing promoter and campaigner users so the platform is usable in a
     * dev/test environment without hitting the real Dojah API.
     *
     * Run with:  php artisan db:seed --class=KycVerificationSeeder
     */
    public function run(): void
    {
        $users = User::with(['promoter', 'campaigner'])
            ->whereIn('role', ['promoter', 'campaigner'])
            ->get();

        if ($users->isEmpty()) {
            $this->command->warn('No promoter or campaigner users found. Run other seeders first.');
            return;
        }

        $banks = [
            ['code' => '044', 'name' => 'Access Bank'],
            ['code' => '058', 'name' => 'GTBank'],
            ['code' => '057', 'name' => 'Zenith Bank'],
            ['code' => '011', 'name' => 'First Bank'],
            ['code' => '033', 'name' => 'United Bank for Africa'],
        ];

        $statuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];

        foreach ($users as $index => $user) {
            $isPromoter   = $user->role === 'promoter';
            $verifiedName = $isPromoter
                ? strtoupper(trim(($user->promoter?->first_name ?? 'TEST') . ' ' . ($user->promoter?->last_name ?? 'USER')))
                : strtoupper($user->campaigner?->company_name ?? 'TEST COMPANY LTD');

            // Cycle through statuses so we get a mix in dev
            $status = $statuses[$index % count($statuses)];

            KycVerification::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'status'           => $status,
                    'id_type'          => $index % 2 === 0 ? 'bvn' : 'nin',
                    'id_number'        => str_pad((string) random_int(10000000000, 99999999999), 11, '0', STR_PAD_LEFT),
                    'verified_name'    => $verifiedName,
                    'name_match_score' => match($status) {
                        'approved' => random_int(80, 100),
                        'pending'  => random_int(55, 69),
                        'rejected' => random_int(10, 40),
                    },
                    'admin_note'  => $status === 'rejected' ? 'Name on ID does not match registered name.' : null,
                    'reviewed_at' => $status === 'approved' ? now() : null,
                ]
            );

            // Seed a payout account for approved advertisers
            if ($user->role === 'campaigner' && $status === 'approved') {
                $bank = $banks[$index % count($banks)];

                UserPayoutAccount::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'bank_code'      => $bank['code'],
                        'bank_name'      => $bank['name'],
                        'account_number' => str_pad((string) random_int(1000000000, 9999999999), 10, '0', STR_PAD_LEFT),
                        'account_name'   => $verifiedName,
                    ]
                );
            }

            $this->command->line(
                "  <fg=green>✓</> {$user->email} ({$user->role}) → KYC <fg=yellow>{$status}</>"
                . ($user->role === 'campaigner' && $status === 'approved' ? ' + payout account' : '')
            );
        }

        $this->command->newLine();
        $this->command->info('KYC seeding complete.');
    }
}
