<?php

namespace App\Modules\User\Controllers;

use App\Http\Controllers\ApiController;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferralController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get users referred by the current user
        $referrals = User::where('referred_by', $user->id)
            ->withCount(['shareLogs as completed_posts_count' => function ($query) {
                $query->where('action', 'verified');
            }])
            ->withSum(['shareLogs as total_spent' => function ($query) {
                $query->where('action', 'verified');
            }], 'earned_amount')
            ->get();

        // Calculate 10% of the total spent by all referred users
        $totalEarnings = $referrals->sum('total_spent') * 0.10;

        return Inertia::render('Referrals', [
            'referrals' => $referrals,
            'totalEarnings' => $totalEarnings
        ]);
    }
}
