<?php

use App\Models\PostVerification;
use App\Modules\Promoter\Jobs\DispatchPostVerificationRechecksJob;
use App\Modules\Promoter\Jobs\VerifyPostRecheckJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::job(new DispatchPostVerificationRechecksJob)->everyMinute();
