<?php

namespace App\Modules\Promoter\Services;

use App\Models\PostVerification;
use App\Models\PromoterEarning;
use App\Models\PromoterSubmission;
use App\Models\Transaction;
use App\Modules\Campeigner\Notifications\CampaignProcessCompletedNotification;
use App\Modules\Promoter\Jobs\VerifyPostInitialJob;
use App\Notifications\CampaignProofFailedNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

use function Laravel\Prompts\info;

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

            // ── Twitter / X ──────────────────────────────────────────────────────

            // Standard tweet/post: https://x.com/user/status/123456789012345678
            '#(twitter\.com|x\.com)/\w+/status/\d{10,20}#i',

            // Twitter Spaces: https://x.com/i/spaces/1YqGoAwQePAbc
            '#(twitter\.com|x\.com)/i/spaces/[A-Za-z0-9]{12,20}#i',

            // ── Instagram ────────────────────────────────────────────────────────

            // Photo post: https://instagram.com/p/ABC123def45
            '#instagram\.com/p/[A-Za-z0-9_-]{10,12}#i',

            // Reel: https://instagram.com/reel/ABC123def45
            '#instagram\.com/reel/[A-Za-z0-9_-]{10,12}#i',

            // IGTV: https://instagram.com/tv/ABC123def45
            '#instagram\.com/tv/[A-Za-z0-9_-]{10,12}#i',

            // Highlight: https://instagram.com/highlight/17876498347553908
            '#instagram\.com/highlight/\d{10,20}#i',

            // ── TikTok ───────────────────────────────────────────────────────────

            // Standard video: https://tiktok.com/@username/video/1234567890123456789
            '#tiktok\.com/@[\w.-]+/video/\d{15,25}#i',

            // Short share link: https://vm.tiktok.com/ZMrABCDEF/
            '#vm\.tiktok\.com/[A-Za-z0-9]+#i',

            // Web short link: https://www.tiktok.com/t/ZTRqPPcXy/
            '#tiktok\.com/t/[A-Za-z0-9]+#i',

            // ── Facebook ─────────────────────────────────────────────────────────

            // Standard post: https://facebook.com/username/posts/123456789
            '#facebook\.com/[^/]+/posts/\d+#i',

            // Video (legacy): https://facebook.com/username/videos/123456789
            '#facebook\.com/[^/]+/videos/\d+#i',

            // Reel (since June 2025 all videos are reels):
            // https://facebook.com/reel/1234567890123456
            '#facebook\.com/reel/\d+#i',

            // Share link: https://facebook.com/share/1L5tN7BNxU/
            '#facebook\.com/share/[A-Za-z0-9_-]+/?#i',

            // Share reel: https://facebook.com/share/r/1L5tN7BNxU/
            '#facebook\.com/share/r/[A-Za-z0-9_-]+/?#i',

            // Share video: https://facebook.com/share/v/1L5tN7BNxU/
            '#facebook\.com/share/v/[A-Za-z0-9_-]+/?#i',

            // Photo: https://facebook.com/photo?fbid=123456789
            '#facebook\.com/photo\?fbid=\d+#i',

            // Photo permalink: https://facebook.com/photo.php?fbid=123456789
            '#facebook\.com/photo\.php\?fbid=\d+#i',

            // Watch video: https://facebook.com/watch?v=123456789
            '#facebook\.com/watch\?v=\d+#i',

            // Story: https://facebook.com/stories/username/12345678901234567
            '#facebook\.com/stories/[^/]+/\d+#i',

            // Group post: https://facebook.com/groups/groupname/posts/123456789
            '#facebook\.com/groups/[^/]+/posts/\d+#i',

            // ── YouTube ──────────────────────────────────────────────────────────

            // Standard watch: https://youtube.com/watch?v=dQw4w9WgXcQ
            '#youtube\.com/watch\?v=[A-Za-z0-9_-]{11}#i',

            // Short URL: https://youtu.be/dQw4w9WgXcQ
            '#youtu\.be/[A-Za-z0-9_-]{11}#i',

            // YouTube Shorts: https://youtube.com/shorts/dQw4w9WgXcQ
            '#youtube\.com/shorts/[A-Za-z0-9_-]{11}#i',

            // YouTube Live: https://youtube.com/live/dQw4w9WgXcQ
            '#youtube\.com/live/[A-Za-z0-9_-]{11}#i',

            // ── LinkedIn ─────────────────────────────────────────────────────────

            // Standard post: https://linkedin.com/posts/username_activity-123456-text
            '#linkedin\.com/posts/[A-Za-z0-9_-]+#i',

            // Feed update URN: https://linkedin.com/feed/update/urn:li:activity:123456
            '#linkedin\.com/feed/update/urn:li:[a-z]+:\d+#i',

            // Video post: https://linkedin.com/video/live/urn:li:ugcPost:123456
            '#linkedin\.com/video/[A-Za-z0-9_/-]+#i',
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
        Log::info('Detecting platform from URL', ['url' => $url]);
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
        info("initiated post verification");
        if (!$platform) {
            Log::warning('Unable to detect platform from URL', [
                'verification_id' => $verification->id,
                'url' => $postUrl,
            ]);

            $verification->update([
                'status' => 'failed',
            ]);

            return $verification;
        }
        info("initiated post verification - platform detected: $platform");
        VerifyPostInitialJob::dispatch($verification);

        return $verification;
    }


    public function rewardPromoter(PostVerification $verification): void
    {
        DB::transaction(function () use ($verification) {
            $submission = $verification->promoterSubmission;
            $campaign = $submission->campaign;

            $existingLog = $submission->shareLog()
                ->where('action', 'verified')
                ->first();

            if ($existingLog) {
                return;
            }

            $submission->shareLog()->where('user_id', $verification->user_id)
                ->where('campaign_id', $campaign->id)
                ->first()
                ->update([
                    'action' => 'verified',
                ]);

            $campaign->decrement('available_slots', 1);

            $campaign->refresh();
            if ($campaign->available_slots < 1) {
                $campaign->update(['status' => 'completed']);
            }

            $submission->user->wallet->increment('balance', $campaign->payout * 100);

            if (!Transaction::where('reference', 'CRD-' . $submission->id)->exists()) {
                $submission->user->wallet->transactions()->create([
                    'type' => 'credit',
                    'amount' => $campaign->payout * 100, // assuming amount is in cents
                    'reference' => "CRD-" . $submission->id,
                    'status' => 'successful',
                    'description' => 'Earnings from verified post for campaign: ' . $campaign->title,
                ]);
            } else {
                Transaction::where('reference', 'CRD-' . $submission->id)
                    ->where('status', 'pending')
                    ->update([
                        'status' => 'successful',
                    ]);
            }


            $campaign->user->notify(new CampaignProcessCompletedNotification($campaign));
        });
    }


    public function initiatePendingPayout(PostVerification $verification): void
    {
        // Implementation for initiating pending payout
        $submission = $verification->promoterSubmission;
        $campaign = $submission->campaign;

        $submission->user->wallet->transactions()->updateOrCreate([
            'reference' => "CRD-" . $submission->id,
        ], [
            'type' => 'credit',
            'amount' => $campaign->payout * 100, // assuming amount is in cents
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


    public function rejectPost(PromoterSubmission $promoterSubmission): void
    {
        DB::transaction(function () use ($promoterSubmission) {

            $promoterSubmission->update([
                'status' => 'rejected',
            ]);

            $verification = $promoterSubmission->verification;

            $verification->update(['status' => 'failed']);
            $promoterSubmission->shareLog->update(['action' => 'rejected']);

            $promoterSubmission->user->wallet->transactions()
                ->where('reference', 'CRD-' . $promoterSubmission->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'failed',
                ]);

            Log::info('Post verification rejected', [
                'verification_id' => $verification->id,
                'submission_id' => $promoterSubmission->id,
            ]);
        });

        // outside transaction (important)
        $promoterSubmission->user
            ->notify(new CampaignProofFailedNotification(
                $promoterSubmission->campaign,
                'rejected'
            ));
    }
}
