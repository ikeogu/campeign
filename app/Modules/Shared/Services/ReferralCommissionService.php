<?php

namespace App\Modules\Shared\Services;

use App\Models\Campaign;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReferralCommissionService
{
    /**
     * Credit the funding advertiser's referrer their cut of this campaign's
     * management fee, if all of the following hold:
     *   - the advertiser was actually referred (User::referred_by is set)
     *   - the campaign carries a management fee (trial campaigns don't)
     *   - the advertiser hasn't already used up their referral_campaign_limit
     *     worth of credited campaigns (config('wallet.referral_campaign_limit'))
     *
     * The advertiser is charged exactly what they'd be charged either way —
     * this only decides who the existing management fee goes to. Call this
     * once, right after a campaign is marked 'live' by funding.
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

        $referrer = $advertiser->referredBy;
        if (! $referrer || ! $referrer->wallet) {
            Log::warning('Referral fee split skipped — referrer or referrer wallet missing', [
                'campaign_id' => $campaign->id,
                'referred_by' => $advertiser->referred_by,
            ]);
            return;
        }

        $share      = (float) config('wallet.referral_fee_share', 0.5);
        $creditKobo = (int) round($feeNaira * 100 * $share);

        if ($creditKobo <= 0) {
            return;
        }

        DB::transaction(function () use ($referrer, $campaign, $advertiser, $creditKobo) {
            $wallet = $referrer->wallet()->lockForUpdate()->firstOrFail();
            $wallet->increment('balance', $creditKobo);

            $wallet->transactions()->create([
                'type'        => 'credit',
                'amount'      => $creditKobo,
                'channel'     => 'referral_bonus',
                'status'      => 'success',
                'description' => "Referral bonus — {$advertiser->email} funded campaign \"{$campaign->title}\"",
                'reference'   => 'REF-' . Str::upper(Str::random(10)),
                'metadata'    => ['campaign_id' => $campaign->id],
            ]);

            $campaign->update(['referral_credited_kobo' => $creditKobo]);
        });

        Log::info('Referral fee split credited', [
            'campaign_id'  => $campaign->id,
            'referrer_id'  => $referrer->id,
            'credit_kobo'  => $creditKobo,
        ]);

        $referrer->notify(new NotifyAnythingNotification(
            'Referral Bonus Credited',
            'You just earned ₦' . number_format($creditKobo / 100, 2)
                . ' because someone you referred funded a campaign. It\'s already in your wallet.'
        ));
    }
}
