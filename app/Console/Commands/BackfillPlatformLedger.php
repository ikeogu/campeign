<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Modules\Shared\Services\PlatformLedgerService;
use Illuminate\Console\Command;

class BackfillPlatformLedger extends Command
{
    protected $signature   = 'ledger:backfill';
    protected $description = 'Create platform ledger entries for campaigns funded before the ledger existed, including money already paid out of them to promoters and referrers/ambassadors.';

    public function handle(PlatformLedgerService $ledger): int
    {
        // Only campaigns that were actually funded (never 'pending') and
        // haven't been recorded yet — safe to re-run, since every campaign
        // this processes gets ledger_recorded_at set, taking it out of this
        // query on the next run.
        $campaigns = Campaign::where('status', '!=', 'pending')
            ->whereNull('ledger_recorded_at')
            ->with('user.referredBy')
            ->get();

        if ($campaigns->isEmpty()) {
            $this->info('Nothing to backfill — every funded campaign already has ledger entries.');
            return self::SUCCESS;
        }

        $this->info("Backfilling ledger entries for {$campaigns->count()} campaign(s)...");

        foreach ($campaigns as $campaign) {
            // 1. Record the original funding — credits promoter_payable and
            //    management_fee_revenue with this campaign's full
            //    base_budget/management_fee, and sets ledger_recorded_at.
            $ledger->recordCampaignFunding($campaign);

            // 2. Catch up promoter_payable for shares already paid out
            //    before the ledger existed. target_shares - available_slots
            //    is exactly how many submissions have been approved/paid
            //    (PostVerificationService decrements available_slots once
            //    per paid submission, never for any other reason).
            $sharesPaid = max(0, $campaign->target_shares - $campaign->available_slots);
            $alreadyPaidKobo = (int) round($campaign->payout * 100 * $sharesPaid);

            if ($alreadyPaidKobo > 0) {
                $ledger->debit(
                    PlatformLedgerService::PROMOTER_PAYABLE,
                    $alreadyPaidKobo,
                    channel: 'promoter_payout_backfill',
                    description: "Backfill — {$sharesPaid} share(s) already paid before the ledger existed — campaign \"{$campaign->title}\"",
                    campaign: $campaign,
                );
            }

            // 3. Catch up management_fee_revenue for any referral/ambassador
            //    commission already paid out of this campaign's fee before
            //    the ledger existed (referral_credited_kobo is set the
            //    moment ReferralCommissionService pays a referrer).
            if ($campaign->referral_credited_kobo !== null && $campaign->referral_credited_kobo > 0) {
                $ledger->debit(
                    PlatformLedgerService::MANAGEMENT_FEE_REVENUE,
                    (int) $campaign->referral_credited_kobo,
                    channel: 'referral_backfill',
                    description: "Backfill — referral/ambassador commission already paid before the ledger existed — campaign \"{$campaign->title}\"",
                    campaign: $campaign,
                );
            }

            $this->line("  ✓ {$campaign->title} ({$campaign->id})");
        }

        $this->info('Done.');
        $this->newLine();
        $this->table(
            ['Account', 'Balance (₦)'],
            collect([PlatformLedgerService::MANAGEMENT_FEE_REVENUE, PlatformLedgerService::PROMOTER_PAYABLE])
                ->map(fn ($key) => [
                    $key,
                    number_format((\App\Models\PlatformLedgerAccount::where('key', $key)->first()?->balance ?? 0) / 100, 2),
                ]),
        );

        return self::SUCCESS;
    }
}
