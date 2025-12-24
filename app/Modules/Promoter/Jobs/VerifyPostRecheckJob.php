<?php

namespace App\Modules\Promoter\Jobs;

use App\Models\PostVerification;
use App\Modules\Promoter\Services\PostVerificationService;
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
    )
    {
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

        if (!$service->isAccessible($this->verification->post_url)) {
            $this->verification->update(['status' => 'failed']);
            return;
        }

        $hours = $this->verification->first_verified_at
            ->diffInHours(now());

        if ($hours >= 48) {
            $this->verification->update([
                'status' => 'verified',
                'last_checked_at' => now(),
            ]);
            return;
        }

        $this->verification->increment('checks');
        $this->verification->update(['last_checked_at' => now()]);

    }
}
