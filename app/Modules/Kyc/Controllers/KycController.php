<?php

namespace App\Modules\Kyc\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Kyc\Services\KycService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KycController extends Controller
{
    public function __construct(private readonly KycService $kycService) {}

    public function show()
    {
        $user = Auth::user()->load(['kyc', 'promoter', 'campaigner']);

        return Inertia::render('Kyc/Submit', [
            'kyc' => $user->kyc ? [
                'status'        => $user->kyc->status,
                'verified_name' => $user->kyc->verified_name,
                'id_type'       => $user->kyc->id_type,
                'submitted_at'  => $user->kyc->created_at->format('d M Y'),
            ] : null,
            'user_role' => $user->role,
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'id_type'   => 'required|in:bvn,nin',
            'id_number' => [
                'required',
                'digits:11',
            ],
        ], [
            'id_number.digits' => 'Your :attribute must be exactly 11 digits.',
        ]);

        $user   = Auth::user()->load(['promoter', 'campaigner']);
        $result = $this->kycService->submit($user, $request->id_type, $request->id_number);

        return back()->with('kyc_result', $result);
    }
}
