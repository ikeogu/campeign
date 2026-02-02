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
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0',
                ])
                ->head($url);

            Log::debug('Post verification HTTP response', [
                'url' => $url,
                'status' => $response->status(),
                //'body' => $response->body(),
                'failed' => $response->failed(),
                'successful' => $response->successful(),
                'redirect' => $response->redirect(),

            ]);

            if ($response->failed()) {
                return false;
            }

            if ($response->successful() || $response->redirect()) {
                $body = strtolower($response->body());

                // Known "removed / unavailable" signals
                if (
                    str_contains($body, 'not available') ||
                    str_contains($body, 'isn’t available') ||
                    str_contains($body, 'page not found') ||
                    str_contains($body, 'this video is unavailable') ||
                    str_contains($body, 'private video')
                ) {
                    return false;
                }

                return true;
            }

            return false;
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
