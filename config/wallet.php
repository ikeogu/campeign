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

];
