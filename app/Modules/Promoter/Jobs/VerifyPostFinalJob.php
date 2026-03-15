<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Models\PromoterSubmission;
use App\Modules\Promoter\Services\PostVerificationService;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifyPostFinalJob implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public PostVerification $verification
    ) {}

    public function handle(PostVerificationService $service): void
    {
        $verification = $this->verification->fresh();

        if (!$verification || $verification->status !== 'pending') {
            return;
        }

        $submission = $verification->promoterSubmission;

        if (!$submission) {
            Log::error('Submission missing during final verification', [
                'verification_id' => $verification->id
            ]);

            $verification->update(['status' => 'failed']);
            return;
        }

        if (!$service->isAccessible($submission->link)) {

            $this->markAsFailed($submission, "Platform was inaccessible");
            return;
        }

        // Mark verified
       $this->markAsVerified($submission, $service);
    }

    private function markAsFailed(PromoterSubmission $submission, string $reason = 'Verification failed'): void
    {
        $this->verification->update([
            'status' => 'failed',
            'last_checked_at' => now(),
        ]);

        $submission->update(['status' => 'rejected']);
        $submission->shareLogs()->update(['action' => 'failed']);

        $this->notifyUserOfPostStatus($submission, 'failed');
    }

    private function markAsVerified(PromoterSubmission $submission, PostVerificationService $service): void
    {
        $this->verification->update([
            'status' => 'verified',
            'last_checked_at' => now(),
        ]);

        $submission->update(['status' => 'approved']);
        $submission->shareLogs()->update(['action' => 'verified']);

        $service->rewardPromoter($this->verification);

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