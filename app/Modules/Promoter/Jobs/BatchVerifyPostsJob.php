<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Modules\Promoter\Services\PostVerificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class BatchVerifyPostsJob implements ShouldQueue
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
    public function handle(PostVerificationService $service)
    {
        PostVerification::query()
            ->where('status', 'pending')
            ->whereNotNull('next_check_at')
            ->where('next_check_at', '<=', now())
            ->limit(200)
            ->get()
            ->each(function ($verification) use ($service) {

                VerifyPostFinalJob::dispatch($verification);
            });
    }
}