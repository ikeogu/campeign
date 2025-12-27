<?php

namespace App\Modules\Shared\Controllers;

use App\Http\Controllers\ApiController;
use App\Models\Campaign;
use App\Models\PostVerification;
use App\Models\PromoterEarning;
use App\Models\PromoterSubmission;
use App\Models\ShareLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends ApiController
{
    public function campainer()
    {
        $user = Auth::user();

        /**
         * ------------------------------------------------------------
         * TOP METRICS
         * ------------------------------------------------------------
         */
        $totalSpend = Campaign::where('user_id', $user->id)
            ->whereIn('status', ['approved', 'live', 'completed'])
            ->sum('total_budget');

        $verifiedSubmissions = PostVerification::whereHas(
            'promoterSubmission.campaign',
            fn($q) => $q->where('user_id', $user->id)
        )
            ->where('status', 'verified')
            ->count();

       /*  $totalReach = PromoterSubmission::whereHas(
            'campaign',
            fn($q) => $q->where('user_id', $user->id)
        )->sum('estimated_reach'); // optional column

        $avgEngagement = PromoterSubmission::whereHas(
            'campaign',
            fn($q) => $q->where('user_id', $user->id)
        )
            ->avg('engagement_rate') ?? 0; */

        /**
         * ------------------------------------------------------------
         * SPEND / REACH / SUBMISSIONS — LAST 6 MONTHS
         * ------------------------------------------------------------
         */
        $monthlyStats = Campaign::query()
            ->selectRaw('
                DATE_FORMAT(created_at, "%b") as month,
                SUM(total_budget) as spend
            ')
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [now()->subMonths(5), now()])
            ->groupBy('month')
            ->orderByRaw('MIN(created_at)')
            ->get()
            ->map(function ($row) use ($user) {
                $monthStart = Carbon::parse("first day of {$row->month}");
                $monthEnd   = $monthStart->copy()->endOfMonth();

                return [
                    'month'       => $row->month,
                    'spend'       => (int) $row->spend
                    /* 'reach'       => PromoterSubmission::whereBetween('created_at', [$monthStart, $monthEnd])
                        ->whereHas('campaign', fn($q) => $q->where('user_id', $user->id))
                        ->sum('estimated_reach') */,
                    'submissions' => PromoterSubmission::whereBetween('created_at', [$monthStart, $monthEnd])
                        ->whereHas('campaign', fn($q) => $q->where('user_id', $user->id))
                        ->count(),
                ];
            });

        /**
         * ------------------------------------------------------------
         * CAMPAIGN PERFORMANCE (COMPLETION %)
         * ------------------------------------------------------------
         */
        $campaignPerformance = Campaign::where('user_id', $user->id)
            ->withCount([
                'images',
                'promoterSubmissions as completed_shares' => fn($q) =>
                $q->where('status', 'verified')
            ])
            ->get()
            ->map(fn($campaign) => [
                'name'       => $campaign->title,
                'completion' => $campaign->target_shares > 0
                    ? round(($campaign->completed_shares / $campaign->target_shares) * 100)
                    : 0,
                'spend'      => (int) $campaign->total_budget,
            ]);

        return [
            'stats' => [
                'totalSpend'        => $totalSpend,
                //'totalReach'        => $totalReach,
                'verifiedGigs'      => $verifiedSubmissions,
                //'avgEngagement'     => round($avgEngagement, 2),
            ],
            'charts' => [
                'monthly'           => $monthlyStats,
                'campaignPerformance' => $campaignPerformance,
            ],
        ];
    }

    public function promoter()
    {
        $user = Auth::user();
        $userId = $user->id;
        /**
         * -----------------------------
         * STATS
         * -----------------------------
         */

        $approvedProofs = PromoterSubmission::where('user_id', $userId)
            ->where('status', 'approved')
            ->count();

        $pendingProofs = PromoterSubmission::where('user_id', $userId)
            ->where('status', 'pending')
            ->count();

        $totalProofs = PromoterSubmission::where('user_id', $userId)->count();

        $successRate = $totalProofs > 0
            ? round(($approvedProofs / $totalProofs) * 100, 1)
            : 0;

        $totalPayouts = PromoterEarning::where('promoter_id', $user->promoter->id)
            ->where('status', 'verified')
            ->sum('amount'); // adjust field name if different

        /**
         * -----------------------------
         * EARNINGS TREND (AREA CHART)
         * -----------------------------
         */
        $earningsTrend = ShareLog::select(
            DB::raw("DATE_FORMAT(created_at, '%b') as month"),
            DB::raw('SUM(earned_amount) as earned'),
            DB::raw('COUNT(*) as proofs')
        )
            ->where('user_id', $userId)
            ->where('action', 'verified')
            ->groupBy('month')
            ->orderByRaw("MIN(created_at)")
            ->get();

        /**
         * -----------------------------
         * PLATFORM PERFORMANCE
         * -----------------------------
         */
        $platformPerformance = PromoterSubmission::select(
            'platform',
            DB::raw('COUNT(*) as value')
        )
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->groupBy('platform')
            ->get()
            ->map(fn($row) => [
                'name' => ucfirst($row->platform),
                'value' => $row->value,
                'color' => match ($row->platform) {
                    'tiktok' => '#000000',
                    'twitter' => '#1DA1F2',
                    'instagram' => '#E1306C',

                    default => '#6B7280',
                },
            ]);

        /**
         * -----------------------------
         * RECOMMENDED GIGS
         * -----------------------------
         */
        $recommendedGigs = Campaign::query()
            ->where('status', 'live')
            ->where('available_slots', '>', 5)
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn($campaign) => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'platform' => $campaign->platform,
                'payout' => $campaign->payout_per_share,
                'slots_left' => $campaign->target_shares - $campaign->shares_completed,
                'ends_at' => $campaign->ends_at?->diffForHumans(),
            ]);

        return [
            'stats' => [
                'totalPayouts'   => $totalPayouts,
                'approvedProofs' => $approvedProofs,
                'pendingProofs'  => $pendingProofs,
                'successRate'    => $successRate,
                'tier'           => 'Gold', // can be dynamic later
            ],
            'charts' => [
                'earningsTrend'      => $earningsTrend,
                'platformPerformance' => $platformPerformance,
            ],
            'recommendedGigs' => $recommendedGigs,
        ];
    }

    public function dashboard()
    {
        $user = Auth::user();
        $data =  match ($user->role) {
            'promoter' => $this->promoter(),
            default => $this->campainer()
        };

        return Inertia::render('Dashboard', array_merge($data, ['user' => $user]));
    }
}
