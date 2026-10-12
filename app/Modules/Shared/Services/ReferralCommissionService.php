<?php

namespace App\Modules\Shared\Services;

use App\Models\Campaign;
use App\Models\User;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReferralCommissionService
{
    public function __construct(
        protected readonly PlatformLedgerService $platformLedgerService,
    ) {}

    /**
     * Credit the funding advertiser's referrer for this campaign, if the
     * advertiser was actually referred (User::referred_by is set) and the
     * campaign hasn't already been processed. Call this once, right after a
     * campaign is marked 'live' by funding.
     *
     * Two payout modes, decided by the referrer:
     *   - Ambassador referrers (User::is_ambassador, rate set from the
     *     backoffice via ambassador_commission_rate) are paid that
     *     percentage of the campaign's base_budget — carved straight out of
     *     the platform's 10% management fee, not an extra charge to the
     *     advertiser — on every fee-bearing campaign the advertiser ever
     *     funds, with no cap. e.g. a 5% rate on a 100k-base campaign (10k
     *     fee) pays the ambassador 5k, leaving the platform the other 5k.
     *   - Everyone else keeps the original behaviour: a config-driven share
     *     of the management fee only, and only for the advertiser's first
     *     few fee-bearing campaigns (config('wallet.referral_campaign_limit')).
     */
    public function creditReferrerIfEligible(Campaign $campaign): void
    {
        $campaign->loadMissing('user');
        $advertiser = $campaign->user;

        if (! $advertiser || ! $advertiser->referred_by) {
            return;
        }

        if ($campaign->referral_credited_kobo !== null) {
            return; // already processed for this campaign
        }

        $referrer = $advertiser->referredBy;
        if (! $referrer || ! $referrer->wallet) {
            Log::warning('Referral fee split skipped — referrer or referrer wallet missing', [
                'campaign_id' => $campaign->id,
                'referred_by' => $advertiser->referred_by,
            ]);
            return;
        }

        if ($referrer->isActiveAmbassador()) {
            $this->creditAmbassador($campaign, $advertiser, $referrer);
            return;
        }

        $this->creditStandardReferrer($campaign, $advertiser, $referrer);
    }

    /**
     * Ambassador payout: carved directly out of the platform's management
     * fee, not an extra charge to the advertiser. The ambassador's rate is
     * a percentage of base_budget (the same base the 10% fee itself is
     * computed from) — so at the standard 10% fee rate, a 5% ambassador
     * rate is exactly half the fee, mirroring how the backoffice describes
     * it ("we collect 10%, split 5/5 between platform and ambassador").
     * Uncapped and repeats on every fee-bearing campaign the advertiser
     * ever funds (unlike the standard referrer path below).
     */
    private function creditAmbassador(Campaign $campaign, User $advertiser, User $referrer): void
    {
        $feeNaira = (float) ($campaign->management_fee ?? 0);
        if ($feeNaira <= 0) {
            return; // e.g. trial campaigns carry no fee
        }

        $baseBudgetNaira = (float) ($campaign->base_budget ?? 0);
        $rate            = (float) $referrer->ambassador_commission_rate;
        $creditKobo      = (int) round($baseBudgetNaira * 100 * ($rate / 100));

        if ($creditKobo <= 0) {
            return;
        }

        // Sanity check, not an enforced cap: if the ambassador's rate eats
        // more than the fee actually charged, the platform nets negative
        // margin on this campaign's fee (still fine financially — the
        // advertiser's payment covers it — just worth knowing about).
        if ($creditKobo > (int) round($feeNaira * 100)) {
            Log::warning('Ambassador commission exceeds the management fee collected', [
                'campaign_id'  => $campaign->id,
                'referrer_id'  => $referrer->id,
                'rate'         => $rate,
                'credit_kobo'  => $creditKobo,
                'fee_kobo'     => (int) round($feeNaira * 100),
            ]);
        }

        $this->payout(
            $campaign,
            $referrer,
            $creditKobo,
            channel: 'ambassador_commission',
            description: "Ambassador commission ({$rate}% of base budget) — {$advertiser->email} funded campaign \"{$campaign->title}\"",
            notificationTitle: 'Ambassador Commission Credited',
            notificationBody: 'You just earned ₦' . number_format($creditKobo / 100, 2)
                . " ({$rate}% commission) because someone you referred funded a campaign. It's already in your wallet.",
        );

        Log::info('Ambassador commission credited', [
            'campaign_id' => $campaign->id,
            'referrer_id' => $referrer->id,
            'rate'        => $rate,
            'credit_kobo' => $creditKobo,
        ]);
    }

    /**
     * Standard referrer payout: a config-driven share of the management
     * fee, capped to the advertiser's first referral_campaign_limit
     * fee-bearing campaigns.
     */
    private function creditStandardReferrer(Campaign $campaign, User $advertiser, User $referrer): void
    {
        $feeNaira = (float) ($campaign->management_fee ?? 0);
        if ($feeNaira <= 0) {
            return; // e.g. trial campaigns carry no fee
        }

        $limit = (int) config('wallet.referral_campaign_limit', 3);
        $alreadyCredited = Campaign::where('user_id', $advertiser->id)
            ->whereNotNull('referral_credited_kobo')
            ->count();

        if ($alreadyCredited >= $limit) {
            Log::info('Referral fee split skipped — advertiser past referral_campaign_limit', [
                'campaign_id' => $campaign->id,
                'advertiser'  => $advertiser->id,
                'limit'       => $limit,
            ]);
            return;
        }

        $share      = (float) config('wallet.referral_fee_share', 0.5);
        $creditKobo = (int) round($feeNaira * 100 * $share);

        if ($creditKobo <= 0) {
            return;
        }

        $this->payout(
            $campaign,
            $referrer,
            $creditKobo,
            channel: 'referral_bonus',
            description: "Referral bonus — {$advertiser->email} funded campaign \"{$campaign->title}\"",
            notificationTitle: 'Referral Bonus Credited',
            notificationBody: 'You just earned ₦' . number_format($creditKobo / 100, 2)
                . ' because someone you referred funded a campaign. It\'s already in your wallet.',
        );

        Log::info('Referral fee split credited', [
            'campaign_id'  => $campaign->id,
            'referrer_id'  => $referrer->id,
            'credit_kobo'  => $creditKobo,
        ]);
    }

    /**
     * Shared payout mechanics: lock the referrer's wallet, credit it,
     * record the transaction, mark the campaign as processed, and notify.
     */
    private function payout(
        Campaign $campaign,
        User $referrer,
        int $creditKobo,
        string $channel,
        string $description,
        string $notificationTitle,
        string $notificationBody,
    ): void {
        DB::transaction(function () use ($referrer, $campaign, $creditKobo, $channel, $description) {
            $wallet = $referrer->wallet()->lockForUpdate()->firstOrFail();
            $wallet->increment('balance', $creditKobo);

            $wallet->transactions()->create([
                'type'        => 'credit',
                'amount'      => $creditKobo,
                'channel'     => $channel,
                'status'      => 'success',
                'description' => $description,
                'reference'   => 'REF-' . Str::upper(Str::random(10)),
                'metadata'    => ['campaign_id' => $campaign->id],
            ]);

            // This payout comes out of the management fee the platform
            // collected on this campaign — so it has to come back out of
            // management_fee_revenue too, or that ledger balance would
            // overstate what the platform actually kept.
            $this->platformLedgerService->debit(
                PlatformLedgerService::MANAGEMENT_FEE_REVENUE,
                $creditKobo,
                channel: $channel,
                description: $description,
                campaign: $campaign,
            );

            $campaign->update(['referral_credited_kobo' => $creditKobo]);
        });

        $referrer->notify(new NotifyAnythingNotification($notificationTitle, $notificationBody));
    }
}
