<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Models\PromoterSubmission;
use App\Modules\Promoter\Services\PostVerificationService;
use App\Notifications\NotifyAnythingNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

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
        if ($this->verification->status !== 'pending') {
            return;
        }

        if (!$service->isAccessible($this->verification->promoterSubmission->link)) {
            $this->verification->update(['status' => 'failed']);
            $this->notifyUserOfPostStatus($this->verification->promoterSubmission, 'failed');
            return;
        }

        $hours = $this->verification->first_verified_at
            ->diffInHours(now());

        if ($hours >= 48) {
            $this->verification->update([
                'status' => 'verified',
                'last_checked_at' => now(),
            ]);

            $this->notifyUserOfPostStatus($this->verification->promoterSubmission, 'verified');
            return;
        } /* else {
            $service->linkNotUpToTime($this->verification);
        } */

        $this->verification->increment('checks');
        $this->verification->update(['last_checked_at' => now()]);
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
