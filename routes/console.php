<?php

use App\Models\PostVerification;
use App\Modules\Promoter\Jobs\VerifyPostRecheckJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::macro('postVerificationRechecks', function (Schedule $schedule) {
    $schedule->call(function () {
        info("I am checking for Post Verification");
        
        PostVerification::where('status', 'pending')
            ->where(function ($q) {
                $q->whereNull('last_checked_at')
                    ->orWhere('last_checked_at', '<=', now()->subHours(6));
            })
            ->get()
            ->each(
                fn($v) =>
                dispatch(new VerifyPostRecheckJob($v))
            );
    })->everyMinute();
});
