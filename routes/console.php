<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/* Schedule::job(new BatchVerifyPostsJob)
    ->everyFiveMinutes(); */

// Retry pending withdrawal transactions every 5 minutes.
// Processes withdrawals that were queued because the Paystack platform
// balance was insufficient at the time the user submitted.
Schedule::command('withdrawals:process-pending')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();