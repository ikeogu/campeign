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
    /**
     * Credit the funding advertiser's referrer for this campaign, if the
     * advertiser was actually referred (User::referred_by is set) and the
     * campaign hasn't already been processed. Call this once, right after a
     * campaign is marked 'live' by funding.
     *
     * Two payout modes, decided by the referrer:
     *   - Ambassador referrers (User::is_ambassador, rate set from the
     *     backoffice via ambassador_commission_rate) are paid that
     *     percentage of the campaign's total_budget (full ad spend), on
     *     every fee-bearing campaign the advertiser ever funds — no cap.
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
     * Ambassador payout: a flat percentage of the campaign's full spend
     * (total_budget), uncapped and repeating on every fee-bearing campaign
     * the referred advertiser ever funds.
     */
    private function creditAmbassador(Campaign $campaign, User $advertiser, User $referrer): void
    {
        $feeNaira = (float) ($campaign->management_fee ?? 0);
        if ($feeNaira <= 0) {
            return; // e.g. trial campaigns carry no fee
        }

        $spendNaira = (float) ($campaign->total_budget ?? 0);
        $rate       = (float) $referrer->ambassador_commission_rate;
        $creditKobo = (int) round($spendNaira * 100 * ($rate / 100));

        if ($creditKobo <= 0) {
            return;
        }

        $this->payout(
            $campaign,
            $referrer,
            $creditKobo,
            channel: 'ambassador_commission',
            description: "Ambassador commission ({$rate}% of ad spend) — {$advertiser->email} funded campaign \"{$campaign->title}\"",
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

            $campaign->update(['referral_credited_kobo' => $creditKobo]);
        });

        $referrer->notify(new NotifyAnythingNotification($notificationTitle, $notificationBody));
    }
}
