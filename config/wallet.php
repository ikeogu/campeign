<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Withdrawals
    |--------------------------------------------------------------------------
    |
    | When true (default), users can submit withdrawal requests from their
    | wallet and the `withdrawals:process-pending` command will dispatch any
    | queued payouts to the payment gateway as normal.
    |
    | When false, withdrawal requests are rejected up front — before any
    | wallet debit happens — and the scheduled command skips dispatching
    | pending debits entirely, leaving them queued untouched until this is
    | switched back on.
    |
    */

    'withdrawals_enabled' => env('WITHDRAWALS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Referral Fee Split
    |--------------------------------------------------------------------------
    |
    | When a campaign is funded by an advertiser who was referred (User::
    | referred_by is set), the platform still charges the same management fee
    | it always would — nothing changes for the advertiser. What changes is
    | who the fee goes to: this fraction of it is credited straight to the
    | referrer's wallet instead of being kept in full.
    |
    | Placeholder values — tune freely, no code changes needed:
    |   REFERRAL_FEE_SHARE:      0.5 = referrer gets half the management fee
    |                            (e.g. a 10% fee on a referred campaign splits
    |                            5%/5% between referrer and platform).
    |   REFERRAL_CAMPAIGN_LIMIT: how many of that advertiser's campaigns get
    |                            this split before it winds down and the
    |                            platform keeps the full fee again. Default is
    |                            1 — the referrer earns once, from the
    |                            advertiser's first fee-bearing campaign, and
    |                            that's it. Raise it later if referrals should
    |                            ever pay out across more than one campaign.
    |
    */

    'referral_fee_share'      => (float) env('REFERRAL_FEE_SHARE', 0.5),
    'referral_campaign_limit' => (int) env('REFERRAL_CAMPAIGN_LIMIT', 1),

];
