<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Modules\Promoter\Services\PostVerificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifyPostInitialJob implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public PostVerification $verification
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(PostVerificationService $service): void
    {

        $submission = $this->verification->promoterSubmission;

        if (!$submission || empty($submission->link)) {
            Log::warning('Post verification aborted: missing link', [
                'verification_id' => $this->verification->id,
                'submission_id' => $submission?->id,
            ]);

            $this->verification->update([
                'status' => 'failed',
            ]);

            return;
        }

        if (!$service->isAccessible($this->verification->promoterSubmission->link)) {
            
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
