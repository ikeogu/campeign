<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DispatchPostVerificationRechecksJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        info('Dispatching post verification rechecks');

        PostVerification::query()
            ->where('status', 'pending')
            /* ->where(function ($q) {
                $q->whereNull('last_checked_at')
                  ->orWhere('last_checked_at', '<=', now()->subHours(6));
            }) */
            ->each(function (PostVerification $verification) {
                dispatch(new VerifyPostRecheckJob($verification));
            });
    }
}
