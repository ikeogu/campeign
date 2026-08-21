<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Automatic Post Verification
    |--------------------------------------------------------------------------
    |
    | When true (default), submitted proof links go through the automated
    | pipeline: an initial accessibility check, then a final re-check ~48hrs
    | later that approves/rejects the submission and settles the payout.
    |
    | When false, that pipeline is paused entirely — every submission stays
    | "pending" and must be approved/rejected manually from the Proof
    | Submissions admin screen (App\Filament\Resources\ProofResource).
    | Jobs already queued (including delayed 48hr checks) will see this flag
    | is off and no-op rather than acting on their own.
    |
    */

    'auto_verification' => env('POST_AUTO_VERIFICATION', true),

];
