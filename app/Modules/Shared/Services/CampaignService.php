<?php

namespace App\Modules\Shared\Services;

use App\Models\Campaign;

class CampaignService
{

    public function fetchLiveCampaigns(int $limit = 20)
    {
        return  Campaign::with(['images', 'user', 'submissions' => fn($q) => $q->where('status', '!=', 'rejected')])
            ->where('status', 'live')
            ->where('available_slots', '>', 0)
            // Exclude campaigns whose non-rejected submission count already fills all target shares.
            // available_slots is only decremented after 48-hour verification, so without this check
            // fully "booked" campaigns would still appear available.
            ->whereRaw(
                '(SELECT COUNT(*) FROM promoter_submissions WHERE campaign_id = campaigns.id AND status != ?) < campaigns.target_shares',
                ['rejected']
            )
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($gig) {

                // Count only non-rejected submissions for an accurate completion percentage
                $total = $gig->target_shares > 0 ? $gig->target_shares : 1;
                $reached = $gig->submissions->count();

                $completion_percentage = min(100, round(($reached / $total) * 100));
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
