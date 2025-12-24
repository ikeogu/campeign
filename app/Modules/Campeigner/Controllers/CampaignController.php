<?php

namespace App\Modules\Campeigner\Controllers;

use App\Http\Controllers\ApiController;
use App\Models\Campaign;
use App\Models\User;
use App\Modules\Campeigner\Notifications\CampaignFundedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CampaignController extends ApiController
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $campaigns = $user->campaigns()
            ->withCount('submissions')
            ->with('images')
            ->orderBy('id', 'desc')
            ->get();

        $campaigns->transform(function ($campaign) {
            $campaign->image_urls = $campaign->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => asset('storage/' . $image->file_path), // Adjust 'path' and 'asset()' as per your storage setup
                ];
            });
            // Remove the raw 'images' relationship to clean up the data sent to Inertia,
            // unless you specifically need it.
            unset($campaign->images);
            return $campaign;
        });

        return Inertia::render('Advertiser/Campaigns/Index', [
            'campaigns' => $campaigns
        ]);
    }

    public function create()
    {
        return Inertia::render('Advertiser/Campaigns/Create');
    }

    public function store(Request $request)
    {


        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'platforms'      => 'required|array',
            'platforms.*'   => 'string',
            'payout'        => 'required|numeric|min:1',
            'target_shares' => 'required|integer|min:1',
            'files'   => 'required|array',
            'files.*' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,mp4,mov,avi,webm', // Explicitly allow video and image extensions
                'max:51200', // Increased to 50MB to accommodate videos
            ],
            'total_budget' => ['required', 'numeric', 'min:0'],
            'management_fee'  => ['nullable', 'numeric', 'min:0'],
            'base_budget'  => ['nullable', 'numeric', 'min:0'],
            'min_followers'  => ['required', 'string'],
        ]);

        /** @var User $user */
        $user = Auth::user();
        abort_if(
            $user->campaigner && ! $user->campaigner->is_approved,
            403,
            'Your campaigner account is pending approval.'
        );




        DB::transaction(function () use ($validated, $user, $request) {
            $campaign = $user->campaigns()->create([
                'title'         => $validated['title'],
                'description'   => $validated['description'] ?? null,
                'platforms'      => $validated['platforms'],
                'payout'        => $validated['payout'],
                'target_shares' => $validated['target_shares'],
                'total_budget' => $validated['total_budget'],
                'status'        => 'pending',
                'management_fee'  => $validated['management_fee'] ?? null,
                'base_budget'  => $validated['base_budget'] ?? null,
                'min_followers'  => $validated['min_followers'],
            ]);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $filePath = $file->store('campaigns', 'public');

                    $campaign->images()->create([
                        'file_path' => $filePath,
                    ]);
                }
            }
        });


        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign created successfully');
    }

    public function edit(Campaign $campaign)
    {
        // $this->authorize('update', $campaign);
        $campaign->load('images');

        $campaign->image_urls = $campaign->images->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => asset('storage/' . $image->file_path),
            ];
        });

        unset($campaign->images);
        return Inertia::render('Advertiser/Campaigns/Edit', [
            'campaign' => $campaign
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        // $this->authorize('update', $campaign);

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'platforms'      => 'required|array',
            'platforms.*'   => 'string',
            'payout'        => 'required|numeric|min:1',
            'target_shares' => 'required|integer|min:1',
            'status'        => 'nullable|string',
            'new_files'         => 'nullable|array',
            //'target_budget' => ['required', 'numeric', 'min:0'],
            'new_files.*'       => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,mp4,mov,avi,webm', // Explicitly allow video and image extensions
                'max:51200', // Increased to 50MB to accommodate videos
            ],
            'remove_files'  => 'nullable|array',
            'remove_files.*' => 'integer|exists:campaign_images,id',
            'total_budget' => ['required', 'numeric', 'min:0'],
            'management_fee'  => ['nullable', 'numeric', 'min:0'],
            'base_budget'  => ['nullable', 'numeric', 'min:0'],
            'min_followers'  => ['required', 'string'],
        ]);

        $campaign->update([
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'platforms'      => $validated['platforms'],
            'payout'        => $validated['payout'],
            'target_shares' => $validated['target_shares'],
            //'target_budget' => $validated['target_budget'],
            'status'        => $validated['status'],
            'total_budget' => $validated['total_budget'],
            'management_fee'  => $validated['management_fee'] ?? null,
            'base_budget'  => $validated['base_budget'] ?? null,
            'min_followers'  => $validated['min_followers'],
        ]);


        // DELETE SELECTED FILES
        if (!empty($validated['remove_files'])) {
            $imagesToDelete = $campaign->images()->whereIn('id', $validated['remove_files'])->get();

            foreach ($imagesToDelete as $img) {
                Storage::disk('public')->delete($img->file_path);
                $img->delete();
            }
        }

        // ADD NEW IMAGES
        if ($request->hasFile('new_files')) {
            foreach ($request->file('new_files') as $file) {
                $filePath = $file->store('campaigns', 'public');

                $campaign->images()->create([
                    'file_path' => $filePath,
                ]);
            }
        }

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign updated successfully');
    }

    public function destroy(Campaign $campaign)
    {
        // $this->authorize('delete', $campaign);

        $campaign->delete();

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign deleted successfully');
    }

    public function fundCampaign(Campaign $campaign)
    {

        $userBalance = Auth::user()->wallet->balance ?? 0.00;
        return Inertia::render('Advertiser/Campaigns/FundCampaign', [
            'campaign' => $campaign,
            'user_balance' => $userBalance / 100,
        ]);
    }

    public function processFunding(Request $request, Campaign $campaign)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $wallet = $user->wallet;

        $amountInCents = (int) ($validated['amount'] * 100);

        if ($wallet->balance < $amountInCents) {
            $response = $this->payFromPaymentGateway($user, $campaign, $amountInCents);
        } else {
            $response = $this->fundCampaignFromWallet($user, $campaign, $amountInCents);
        }

        if (!$response) {
            return redirect()->back()
                ->with('error', 'Failed to fund the campaign. Please try again.');
        }

        $campaign->user->notify(new CampaignFundedNotification($campaign));

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign funded successfully.');
    }

    private function fundCampaignFromWallet(User $user, Campaign $campaign, $amountInCents)
    {
        $wallet = $user->wallet;

        DB::transaction(function () use ($wallet, $campaign, $amountInCents) {
            // Deduct from wallet
            $wallet->decrement('balance', $amountInCents);

            $wallet->transactions()->create([
                'type'        => 'debit',
                'amount'      => $amountInCents,
                'reference'   => 'FUND_CAMPGN' . $campaign->id,
                'description' => 'Funding for campaign ID: ' . $campaign->id,
                'metadata'    => [
                    'campaign_id' => $campaign->id,
                ],
            ]);

            // Update campaign funding
            $campaign->update(['status' => 'funded']);
            //Notify Admin
        });

        return true;
    }

    private function payFromPaymentGateway(User $user, Campaign $campaign, $amountInCents)
    {
        // Implement payment gateway logic here.
        // This is a placeholder for actual payment processing code.
        return true;
    }

    public function promoterSubmissions(Campaign $campaign)
    {

        $submissions = $campaign->submissions()
            ->with('user:id,email')
            ->latest()
            ->get();

        
        return Inertia::render('Advertiser/Campaigns/Submissions', [
            'campaign' => $campaign,
            'submissions' => $submissions,
        ]);
    }
}
