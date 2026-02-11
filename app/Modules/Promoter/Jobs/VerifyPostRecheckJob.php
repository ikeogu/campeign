<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Models\PromoterSubmission;
use App\Modules\Promoter\Services\PostVerificationService;
use App\Notifications\NotifyAnythingNotification;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class VerifyPostRecheckJob implements ShouldQueue
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
        try {
            // Guard: Skip if not pending
            if ($this->verification->status !== 'pending') {
                return;
            }

            // Ensure first_verified_at is set
            if (!$this->verification->first_verified_at) {
                $this->verification->update([
                    'first_verified_at' => now(),
                    'last_checked_at' => now(),
                ]);

                Log::warning('first_verified_at was null, set to now', [
                    'verification_id' => $this->verification->id,
                ]);

                // Refresh the model
                $this->verification->refresh();
            }

            // Guard: Check if submission exists
            $submission = $this->verification->promoterSubmission;
            if (!$submission) {
                Log::error('Promoter submission not found', [
                    'verification_id' => $this->verification->id,
                ]);
                $this->verification->update(['status' => 'failed']);
                return;
            }

            // Check accessibility
            if (!$service->isAccessible($submission->link)) {
                $this->markAsFailed($submission, 'Post is no longer accessible');
                return;
            }

            // Calculate hours since first verification
            if ($this->verification->first_verified_at) {
                $hoursSincePost = $this->verification->first_verified_at->diffInHours(now());
            }else{
                VerifyPostInitialJob::dispatch($service);
            }

            // Mark as verified if 48 hours passed
            if ($hoursSincePost >= 48) {
                $this->markAsVerified($submission);
                return;
            }

            // Update check metadata
            $this->verification->update([
                'checks' => $this->verification->checks + 1,
                'last_checked_at' => now(),
            ]);
        } catch (Exception $e) {
            Log::error('Post verification job failed', [
                'verification_id' => $this->verification->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function markAsFailed(PromoterSubmission $submission, string $reason = 'Verification failed'): void
    {
        $this->verification->update([
            'status' => 'failed',
            'last_checked_at' => now(),
        ]);

        $this->notifyUserOfPostStatus($submission, 'failed');
    }

    private function markAsVerified(PromoterSubmission $submission): void
    {
        $this->verification->update([
            'status' => 'verified',
            'last_checked_at' => now(),
        ]);

        $this->notifyUserOfPostStatus($submission, 'verified');
    }


    public function notifyUserOfPostStatus(PromoterSubmission $promoterSubmission, string $status)
    {

        if ($status === 'verified') {

            $body = "Your post with link {$promoterSubmission->link} has completed 48hrs after posting, your wallet will be creadited soon.";
            $promoterSubmission->user->notify(new NotifyAnythingNotification("Post Verified", $body));
        } else {
            $body = "Your post with link {$promoterSubmission->link} failed to stay above 48hrs";
            $promoterSubmission->user->notify(new NotifyAnythingNotification("Post Not Verified", $body));
        }
    }
}
