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
    | Management Fee Rate
    |--------------------------------------------------------------------------
    |
    | The platform's cut on every non-trial campaign: management_fee =
    | base_budget * this rate. This is the single source of truth —
    | CampaignController recomputes base_budget/management_fee/total_budget
    | server-side from it on every create/update, rather than trusting
    | whatever the frontend sends. The frontend (Create.jsx / Edit.jsx)
    | still duplicates this value for a live preview before submit; if you
    | change it here, update those too so the advertiser-facing estimate
    | matches what actually gets charged.
    |
    */

    'management_fee_rate' => (float) env('MANAGEMENT_FEE_RATE', 0.10),

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
