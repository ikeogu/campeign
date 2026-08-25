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

        // A platform counts as "submitted" unless that submission was rejected,
        // in which case the promoter may try that platform again.
        $submittedPlatforms = PromoterSubmission::where('campaign_id', $gig->id)
            ->where('user_id', Auth::id())
            ->where('status', '!=', 'rejected')
            ->pluck('platform')
            ->map(fn ($p) => strtolower($p))
            ->unique()
            ->values();

        $gigPlatforms = collect(is_array($gig->platforms) ? $gig->platforms : json_decode($gig->platforms ?? '[]', true))
            ->map(fn ($p) => strtolower($p));

        // Fully submitted only once every platform on this gig has been claimed.
        $hasSubmitted = $gigPlatforms->isNotEmpty() && $gigPlatforms->diff($submittedPlatforms)->isEmpty();

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

        $submittedPlatforms = PromoterSubmission::where('campaign_id', $gig->id)
            ->where('user_id', $user->id)
            ->where('status', '!=', 'rejected')
            ->pluck('platform')
            ->map(fn ($p) => strtolower($p));

        $gigPlatforms = is_array($gig->platforms) ? $gig->platforms : json_decode($gig->platforms ?? '[]', true);

        // Only offer platforms the promoter hasn't already submitted (successfully or pending review) for.
        $availablePlatforms = collect($gigPlatforms)
            ->reject(fn ($p) => $submittedPlatforms->contains(strtolower($p)))
            ->values()
            ->all();

        if (empty($availablePlatforms)) {
            return redirect()->route('promoter.gigs.show', $id)
                ->with('error', 'You have already submitted proof for every platform on this campaign.');
        }

        return Inertia::render('Promoter/Gigs/Submit', [
            'gig' => [
                'id' => $gig->id,
                'title' => $gig->title,
                'platforms' => $availablePlatforms,
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

        // One active submission per platform per campaign — a rejected submission frees the platform back up.
        $alreadySubmittedPlatforms = PromoterSubmission::where('campaign_id', $id)
            ->where('user_id', Auth::id())
            ->where('status', '!=', 'rejected')
            ->pluck('platform')
            ->map(fn ($p) => strtolower($p))
            ->all();

        $duplicatePlatforms = collect($request->submissions)
            ->pluck('platform')
            ->filter(fn ($platform) => in_array(strtolower($platform), $alreadySubmittedPlatforms, true))
            ->map(fn ($platform) => ucfirst($platform))
            ->unique()
            ->all();

        if (!empty($duplicatePlatforms)) {
            return back()->withErrors([
                'submission' => 'You have already submitted proof for ' . implode(', ', $duplicatePlatforms) . '. Remove ' . (count($duplicatePlatforms) > 1 ? 'those platforms' : 'that platform') . ' and try again.',
            ]);
        }

        // A link claimed by someone else is the fraud signal worth blocking — two
        // promoters can't both take credit for the same post. A promoter reusing
        // their OWN link (e.g. their profile URL) across submissions is expected
        // and fine, so this only checks other users, never the current one.
        $submittedLinks = collect($request->submissions)->pluck('link');

        $linksClaimedByOthers = PromoterSubmission::whereIn('link', $submittedLinks)
            ->where('user_id', '!=', Auth::id())
            ->where('status', '!=', 'rejected')
            ->pluck('link')
            ->unique()
            ->all();

        if (!empty($linksClaimedByOthers)) {
            return back()->withErrors([
                'submission' => 'One of these links has already been submitted by another user. Please check the link and try again.',
            ]);
        }

        foreach ($request->submissions as $data) {

            $path = null;

            if (isset($data['proof']) && $data['proof'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $data['proof']->store('promoter_proofs', 'public');
            }

            PromoterSubmission::create([
                'user_id'     => Auth::id(),
                'campaign_id' => $id,
                'proof_link'  => $path,
                'platform'    => $data['platform'],
                'link'        => $data['link'],
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