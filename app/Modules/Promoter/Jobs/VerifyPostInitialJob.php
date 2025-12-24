<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Modules\Promoter\Services\PostVerificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class VerifyPostInitialJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly PostVerification $verification
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(PostVerificationService $service): void
    {
        if (!$service->isAccessible($this->verification->post_url)) {
            $this->verification->update(['status' => 'failed']);
            return;
        }

        $this->verification->update([
            'first_verified_at' => now(),
            'last_checked_at' => now(),
            'checks' => 1,
            'status' => 'pending',
        ]);
    }
}
