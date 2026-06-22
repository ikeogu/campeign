<?php

namespace App\Modules\Kyc\Controllers;

use App\Http\Controllers\Controller;
use App\Interfaces\PaymentGateWayInterface;
use App\Models\UserPayoutAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PayoutAccountController extends Controller
{
    public function __construct(private readonly PaymentGateWayInterface $gateway) {}

    public function show()
    {
        $user = Auth::user()->load(['kyc', 'payoutAccount']);

        return Inertia::render('Wallet/PayoutAccount', [
            'payoutAccount' => $user->payoutAccount,
            'banks'         => $this->gateway->getBanks()['data'],
            'kyc'           => $user->kyc ? ['status' => $user->kyc->status] : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bank_code'      => 'required|string',
            'bank_name'      => 'required|string',
            'account_number' => 'required|digits:10',
            'account_name'   => 'required|string|max:100',
        ]);

        $user = Auth::user()->load(['kyc', 'campaigner']);

        if (! $user->kyc || $user->kyc->status !== 'approved') {
            return back()->withErrors([
                'account_name' => 'Complete identity verification before registering a payout account.',
            ]);
        }

        // Account name must match either the KYC-verified personal name
        // OR the registered company name (≥70% similarity).
        $normalize = static function (string $name): string {
            $tokens = preg_split('/\s+/', strtolower(trim($name)));
            sort($tokens);
            return implode(' ', $tokens);
        };

        $accountName = $request->account_name;
        $kycName     = $user->kyc->verified_name ?? '';
        $bizName     = $user->campaigner?->company_name ?? '';

        similar_text($normalize($accountName), $normalize($kycName), $kycMatch);
        similar_text($normalize($accountName), $normalize($bizName), $bizMatch);

        if (max($kycMatch, $bizMatch) < 70) {
            return back()->withErrors([
                'account_name' => "The account name doesn't match your verified identity or company name. "
                    . "If this is a business account, please contact support.",
            ]);
        }

        UserPayoutAccount::updateOrCreate(
            ['user_id' => $user->id],
            [
                'bank_code'      => $request->bank_code,
                'bank_name'      => $request->bank_name,
                'account_number' => $request->account_number,
                'account_name'   => $request->account_name,
            ]
        );

        return back()->with('message', 'Payout account saved successfully.');
    }
}
