<?php

namespace App\Modules\Promoter\Controllers;

use App\Http\Controllers\ApiController;
use App\Models\Campaign;
use App\Models\CampaignMedia;
use App\Models\PromoterSubmission;
use App\Models\ShareLog;
use App\Modules\Promoter\Requests\SubmitPostRequest;
use App\Modules\Shared\Services\CampaignService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PromoterGigController extends ApiController
{
    public function index()
    {
        $gigs = Campaign::with('images')
            ->where('status', 'live')
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
                    'target_followers' => $gig->target_followers,
                    'available_slots' => $gig->available_slots,
                    'image_urls' => $gig->images->map(fn($i) => [
                        'id' => $i->id,
                        'url' => asset('storage/' . $i->file_path),
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

        return Inertia::render('Promoter/Gigs/Show', [
            'gig' => [
                'id' => $gig->id,
                'title' => $gig->title,
                'description' => $gig->description,
                'platforms' => $gig->platforms,
                'payout' => $gig->payout,
                'target_followers' => $gig->target_followers,
                'available_slots' => $gig->available_slots ?? 'Unlimited',
                'image_urls' => $gig->images->map(fn($i) => [
                    'id' => $i->id,
                    'url' => asset('storage/' . $i->file_path),
                ]),

            ],
            'companyName' => $gig->user->campaigner->company_name,
            'hasSubmitted' => $hasSubmitted,
        ]);
    }


    public function download($id, $imageId)
    {
        $image = CampaignMedia::where('campaign_id', $id)->findOrFail($imageId);

        return response()->download(storage_path('app/public/' . $image->file_path));
    }

    public function submitPage($id)
    {
        $gig = Campaign::findOrFail($id);

        return Inertia::render('Promoter/Gigs/Submit', [
            'gig' => [
                'id' => $gig->id,
                'title' => $gig->title,
                'platforms' => $gig->platforms,
                'payout' => $gig->payout
            ]
        ]);
    }

    public function storeSubmission(SubmitPostRequest $request, $id)
    {

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
}
