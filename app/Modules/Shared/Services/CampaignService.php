<?php

namespace App\Modules\Shared\Services;

use App\Models\Campaign;

class CampaignService
{

    public function fetchLiveCampaigns()
    {
        return  Campaign::with(['images', 'user'])
            ->where('status', 'live')
            ->latest()
            ->get()
            ->map(function ($gig) {

                // Calculate percentage
                $total = $gig->target_shares > 0 ? $gig->target_shares : 1; // Prevent division by zero
                $reached = $gig->submissions->count(); // Number of approved/received shares

                $percentage = ($reached / $total) * 100;

                // Ensure it doesn't exceed 100%
                $completion_percentage = min(100, round($percentage));
                return [
                    'id' => $gig->id,
                    'title' => $gig->title,
                    'description' => $gig->description,
                    'category' => $gig->category,
                    'platforms' => $gig->platforms,
                    'min_followers' => $gig->min_followers,
                    'payout' => $gig->payout,
                    'target_shares' => $gig->target_shares,
                    'target_followers' => $gig->target_followers,
                    'available_slots' => $gig->available_slots,
                    'completion_percentage' => $completion_percentage,
                    'image_urls' => $gig->images->map(fn($i) => [
                        'id' => $i->id,
                        'url' => asset('storage/' . $i->file_path),
                    ]),
                ];
            });
    }
}
