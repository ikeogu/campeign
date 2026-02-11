<?php

namespace App\Modules\Promoter\Services;

use App\Models\PostVerification;
use App\Models\PromoterEarning;
use App\Models\Transaction;
use App\Modules\Campeigner\Notifications\CampaignProcessCompletedNotification;
use App\Modules\Promoter\Jobs\VerifyPostInitialJob;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PostVerificationService
{

    public function isAccessible(string $url): bool
    {
        try {
            // 1️⃣ Social media URLs - validate by pattern only
            if ($this->isKnownSocialPlatform($url)) {
                $isValid = $this->validateSocialMediaUrl($url);

                Log::info('Social media URL validation', [
                    'url' => $url,
                    'valid' => $isValid,
                ]);

                return $isValid;
            }

            // 2️⃣ Regular websites - use HTTP check
            return $this->checkHttpAccessibility($url);
        } catch (\Throwable $e) {
            Log::warning('Post verification failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    private function checkHttpAccessibility(string $url): bool
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept' => 'text/html',
            ])
            ->head($url);

        if ($response->successful() || $response->redirect()) {
            return true;
        }

        // Fallback to GET
        $get = Http::timeout(10)->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ])->get($url);

        return $get->successful();
    }

    private function isKnownSocialPlatform(string $url): bool
    {
        return (bool) preg_match(
            '#(twitter\.com|x\.com|instagram\.com|tiktok\.com|facebook\.com|youtube\.com|youtu\.be|linkedin\.com)#i',
            $url
        );
    }

    private function validateSocialMediaUrl(string $url): bool
    {
        $patterns = [
            // Twitter/X: https://x.com/user/status/123456789
            '#(twitter\.com|x\.com)/.+/status/\d{18,20}#i',

            // Instagram: https://instagram.com/p/ABC123 or /reel/ABC123
            '#instagram\.com/(p|reel)/[A-Za-z0-9_-]{10,12}#i',

            // TikTok: https://tiktok.com/@user/video/1234567890
            '#tiktok\.com/@[\w.-]+/video/\d{18,20}#i',

            // Facebook: https://facebook.com/user/posts/123 or /videos/123
            '#facebook\.com/.+/(posts|videos)/\d+#i',

            // YouTube: https://youtube.com/watch?v=ABC or https://youtu.be/ABC
            '#(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}#i',

            // LinkedIn: https://linkedin.com/posts/...
            '#linkedin\.com/posts/.+#i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url)) {
                return true;
            }
        }

        return false;
    }


    public function detect(string $url): ?string
    {
        return match (true) {
            str_contains($url, 'twitter.com'),
            str_contains($url, 'x.com') => 'twitter',

            str_contains($url, 'instagram.com') => 'instagram',
            str_contains($url, 'facebook.com') => 'facebook',
            str_contains($url, 'tiktok.com') => 'tiktok',
            str_contains($url, 'youtube.com') => 'youtube',
            str_contains($url, 'telegram.me'),
            str_contains($url, 't.me') => 'telegram',

            default => null,
        };
    }


    public function start(PostVerification $verification): PostVerification
    {
        $postUrl = $verification->promoterSubmission->link;
        $platform = $this->detect($postUrl);

        if (!$platform) {
            throw new \InvalidArgumentException('Unsupported platform');
        }

        VerifyPostInitialJob::dispatch($verification);

        return $verification;
    }


    public function rewardPromoter(PostVerification $verification): void
    {
        DB::transaction(function () use ($verification) {
            $submission = $verification->promoterSubmission;
            $campaign = $submission->campaign;

            $existingLog = $submission->shareLogs()
                ->where('action', 'verified')
                ->first();

            if ($existingLog) {
                return;
            }

            $submission->shareLogs()->where('user_id', $verification->user_id)
                ->where('campaign_id', $campaign->id)
                ->first()
                ->update([
                    'action' => 'verified',
                ]);

            $campaign->decrement('available_slots', 1);

            $campaign->refresh();
            if ($campaign->available_slots < 1) {
                $campaign->status = 'completed';
                $campaign->save();
            }


            $submission->user->wallet->transactions()->where('reference', 'CRD-' . $submission->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'successful',
                ]);

            $submission->user->wallet->increment('balance', $campaign->payout);
            $campaign->user->notify(new CampaignProcessCompletedNotification($campaign));
        });
    }


    public function initiatePendingPayout(PostVerification $verification): void
    {
        // Implementation for initiating pending payout
        $submission = $verification->promoterSubmission;
        $campaign = $submission->campaign;

        $submission->user->wallet->transactions()->create([
            'type' => 'credit',
            'amount' => $campaign->payout * 100, // assuming amount is in cents
            'reference' => "CRD-" . $submission->id,
            'status' => 'pending',
            'description' => 'Earnings from verified post for campaign: ' . $campaign->title,
        ]);
    }

    public function linkNotUpToTime(PostVerification $verification): void
    {
        $verification->update([
            'status' => 'failed',
        ]);

        Log::info('Post verification failed due to link not up to time', [
            'verification_id' => $verification->id,
            'promoter_submission_id' => $verification->promoterSubmission->id,
        ]);

        $submission = $verification->promoterSubmission;
        $campaign = $submission->campaign;

        $submission->user->wallet->transactions()->where('reference', 'CRD-' . $submission->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'failed',
            ]);

        $submission->user->notify(new CampaignProcessCompletedNotification($campaign, 'failed'));
    }
}
