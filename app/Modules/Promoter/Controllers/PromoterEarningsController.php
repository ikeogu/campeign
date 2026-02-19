<?php

namespace App\Modules\Promoter\Controllers;

use App\Http\Controllers\ApiController;
use App\Models\PromoterEarning;
use App\Models\PromoterSubmission;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PromoterEarningsController extends ApiController
{

    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        //$user->load('promoter');
        $userId = $user->promoter->id;
        // Summary Stats
        $totalEarnings = PromoterEarning::where('promoter_id', $userId)
            ->where('status', 'completed')
            ->sum('amount');

        $totalWithdrawals = Transaction::where('wallet_id', $user->wallet->id)
            ->where('type', 'debit')
            ->sum('amount');

        $availableBalance = $totalEarnings - $totalWithdrawals;

        $completedPromotions = PromoterEarning::where('promoter_id', $userId)
            ->where('status', 'verified')
            ->count();

        $pendingPayments = PromoterEarning::where('promoter_id', $userId)
            ->where('status', 'pending')
            ->count();

        // Chart Data (Last 30 Days)
        $chartData = PromoterEarning::where('promoter_id', $userId)
            ->where('status', 'verified')
            ->whereDate('completed_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(completed_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Recent Earnings
        $recentEarnings = PromoterEarning::with('campaign')
            ->where('promoter_id', $userId)
            ->orderBy('completed_at', 'desc')
            ->limit(10)
            ->get();

        return inertia('Promoter/EarningsDashboard', [
            'summary' => [
                'totalEarnings' => $totalEarnings,
                'totalWithdrawals' => $totalWithdrawals,
                'availableBalance' => $availableBalance / 100,
                'completedPromotions' => $completedPromotions,
                'pendingPayments' => $pendingPayments,
            ],
            'chartData' => $chartData,
            'recentEarnings' => $recentEarnings,
        ]);
    }

    public function submissions(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $userId = $user->id;

        $submissions = PromoterSubmission::with(['campaign:id,title'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Promoter/SubmissionsList', [
            'submissions' => $submissions,
        ]);
    }
}
