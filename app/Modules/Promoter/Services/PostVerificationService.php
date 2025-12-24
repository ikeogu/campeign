<?php

namespace App\Modules\Promoter\Services;

use App\Models\PostVerification;
use App\Models\Transaction;
use App\Modules\Campeigner\Notifications\CampaignProcessCompletedNotification;
use App\Modules\Promoter\Jobs\VerifyPostInitialJob;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PostVerificationService
{
    public function isAccessible(string $url): bool
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0',
                ])
                ->get($url);

            if (!$response->successful()) {
                return false;
            }

            $body = strtolower($response->body());

            if (
                str_contains($body, 'not available') ||
                str_contains($body, 'content isn’t available') ||
                str_contains($body, 'page not found')
            ) {
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('Post verification failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
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


    public function start(string $postUrl, PostVerification $verification): PostVerification
    {
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

            $submission->shareLogs()->create([
                'user_id' => $verification->user_id,
                'campaign_id' => $campaign->id,
                'earned_amount' => $campaign->payout,
                'action' => 'verified',
            ]);

            $campaign->decrement('available_slots', 1);

            $campaign->refresh();
            if ($campaign->available_slots < 1) {
                $campaign->status = 'completed';
                $campaign->save();
            }

            $submission->user->transactions()->create([
                'type' => 'credit',
                'amount' => $campaign->payout,
                'reference' => "CRD-" . uniqid(),
                'description' => 'Earnings from verified post for campaign: ' . $campaign->title,
            ]);

            $campaign->user->notify(new CampaignProcessCompletedNotification($campaign));

            $submission->user->wallet->increment('balance', $campaign->payout);
        });
    }
}
