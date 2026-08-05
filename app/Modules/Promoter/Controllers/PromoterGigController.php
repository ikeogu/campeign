<?php

namespace App\Modules\Promoter\Controllers;

use App\Http\Controllers\ApiController;
use App\Models\Campaign;
use App\Models\CampaignMedia;
use App\Models\PromoterSubmission;
use App\Models\ShareLog;
use App\Modules\Promoter\Requests\SubmitPostRequest;
use App\Modules\Shared\Services\CampaignService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PromoterGigController extends ApiController
{
    public function index()
    {
        $gigs = Campaign::with(['images'])
            ->where(function ($q) {
                // Live campaigns still accepting submissions
                $q->where(function ($inner) {
                    $inner->where('status', 'live')
                          ->where('available_slots', '>', 0)
                          ->whereRaw(
                              '(SELECT COUNT(*) FROM promoter_submissions WHERE campaign_id = campaigns.id AND status != ?) < campaigns.target_shares',
                              ['rejected']
                          );
                })
                // Completed/exhausted campaigns — visible but locked
                ->orWhere('status', 'completed');
            })
            ->latest()
            ->get()
            ->map(function ($gig) {
                return [
                    'id' => $gig->id,
                    'title' => $gig->title,
                    'description' => $gig->description,
                    'platforms' => $gig->platforms,
                    'payout' => $gig->payout,
                    'target_shares' => $gig->target_shares,
                    'min_followers' => $gig->min_followers,
                    'available_slots' => $gig->available_slots,
                    'status' => $gig->status,
                    'completion_percentage' => $gig->completion_percentage,
                    'image_urls' => $gig->images->map(fn($i) => [
                        'id'       => $i->id,
                        'url'      => asset('storage/' . $i->file_path),
                        'is_video' => $i->is_video,
                    ]),
                ];
            });


        return Inertia::render('Promoter/Gigs/Index', [
            'gigs' => $gigs,
        ]);
    }

    public function guestIndex()
    {
        $gigs = app(CampaignService::class)->fetchLiveCampaigns();

        return Inertia::render('GuestCampaign', [
            'allGigs' => $gigs,
        ]);
    }

    public function show($id)
    {
        $gig = Campaign::with(['images'])->findOrFail($id);

        $hasSubmitted = ShareLog::where([
            'campaign_id' => $gig->id,
            'user_id' => Auth::id(),
        ])
        ->whereIn('action', ['submitted', 'verified', 'completed'])
        ->exists();

        $followerCount = Auth::user()->promoter?->follower_count ?? 0;
        $minFollowers = (int) $gig->min_followers;
        $isEligible = $minFollowers === 0 || $followerCount >= $minFollowers;

        return Inertia::render('Promoter/Gigs/Show', [
            'gig' => [
                'id' => $gig->id,
                'title' => $gig->title,
                'description' => $gig->description,
                'platforms' => $gig->platforms,
                'payout' => $gig->payout,
                'min_followers' => $gig->min_followers,
                'available_slots' => $gig->available_slots ?? 'Unlimited',
                'image_urls' => $gig->images->map(fn($i) => [
                    'id'       => $i->id,
                    'url'      => asset('storage/' . $i->file_path),
                    'is_video' => $i->is_video,
                ]),
                'category' => $gig->category,
            ],
            'companyName' => $gig->user->campaigner->company_name,
            'hasSubmitted' => $hasSubmitted,
            'isEligible' => $isEligible,
            'promoterFollowerCount' => $followerCount,
        ]);
    }


    public function download($id, $imageId)
    {
        $image = CampaignMedia::where('campaign_id', $id)->findOrFail($imageId);

        return response()->download(storage_path('app/public/' . $image->file_path));
    }

    public function submitPage($id)
    {
        /** @var User $user */
        $user = Auth::user();

        $gig = Campaign::findOrFail($id);

        $followerCount = $user->promoter?->follower_count ?? 0;
        $minFollowers = (int) $gig->min_followers;

        if ($minFollowers > 0 && $followerCount < $minFollowers) {
            return redirect()->route('promoter.gigs.show', $id)
                ->with('error', "You need at least " . number_format($minFollowers) . " followers to submit to this campaign. Your current count: " . number_format($followerCount) . ".");
        }

        return Inertia::render('Promoter/Gigs/Submit', [
            'gig' => [
                'id' => $gig->id,
                'title' => $gig->title,
                'platforms' => $gig->platforms,
                'payout' => $gig->payout,
                'promoter_social_handles' => $user->promoter->social_handles,
            ]
        ]);
    }

    public function storeSubmission(SubmitPostRequest $request,string $id)
    {
        $campaign = Campaign::findOrFail($id);

        if ($campaign->status !== 'live') {
            return back()->withErrors(['submission' => 'This campaign is not currently accepting submissions.']);
        }

        if ($rateLimitError = $this->shareRateLimitError(Auth::id(), $campaign->id)) {
            return back()->withErrors(['submission' => $rateLimitError]);
        }

        $activeSubmissions = $campaign->submissions()->where('status', '!=', 'rejected')->count();

        if ($activeSubmissions >= $campaign->target_shares) {
            return back()->withErrors(['submission' => 'This campaign is no longer accepting submissions.']);
        }

        $followerCount = Auth::user()->promoter?->follower_count ?? 0;
        $minFollowers = (int) $campaign->min_followers;

        if ($minFollowers > 0 && $followerCount < $minFollowers) {
            return back()->withErrors([
                'submission' => "You need at least " . number_format($minFollowers) . " followers to submit to this campaign.",
            ]);
        }

        foreach ($request->submissions as $platform => $data) {

            $path = null;

            if (isset($data['proof']) && $data['proof'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $data['proof']->store('promoter_proofs', 'public');
            }

            PromoterSubmission::create([
                'user_id'     => Auth::id(),
                'campaign_id' => $id,
                'proof_link'  => $path,
                'platform'    => $platform,        // derived from key
                'link'        => $data['link'],     // correct source
                'status'      => 'pending',
            ]);
        }

        return redirect()
            ->route('promoter.gigs.index')
            ->with('success', 'Submission received! You will be paid once it is approved.');
    }

    /**
     * A promoter may share at most 2 distinct ads per rolling 24h window, with
     * at least 3h between shares of different ads. Resubmitting to an ad
     * already counted in the window (e.g. a second platform) doesn't consume
     * a new slot or restart the 3h gap.
     */
    private function shareRateLimitError(string $userId, string $campaignId): ?string
    {
        $recentShares = ShareLog::where('user_id', $userId)
            ->where('created_at', '>=', now()->subHours(24))
            ->select('campaign_id', DB::raw('MIN(created_at) as shared_at'))
            ->groupBy('campaign_id')
            ->get();

        $isNewAd = !$recentShares->contains('campaign_id', $campaignId);

        if (!$isNewAd) {
            return null;
        }

        if ($recentShares->count() >= 2) {
            return 'You can only share up to 2 ads every 24 hours. Please try again later.';
        }

        $lastShare = $recentShares->sortByDesc('shared_at')->first();

        if ($lastShare) {
            $minutesSinceLastShare = (int) now()->diffInMinutes($lastShare->shared_at, absolute: true);

            if ($minutesSinceLastShare < 180) {
                $remaining = 180 - $minutesSinceLastShare;
                $waitFor = $remaining >= 60
                    ? sprintf('%dh %dm', intdiv($remaining, 60), $remaining % 60)
                    : "{$remaining}m";

                return "Please wait {$waitFor} before sharing another ad (minimum 3-hour interval between ads).";
            }
        }

        return null;
    }
}