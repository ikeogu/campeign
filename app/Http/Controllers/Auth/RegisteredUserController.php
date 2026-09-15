<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {


        $request->validate([

            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::min(6)],
            'accepted_terms' => ['required', 'bool'],
            // max:20 — must stay >= the longest vanity referral code an
            // ambassador can set from the backoffice (AmbassadorResource
            // caps that at 20 chars). The default auto-generated code is
            // only 6 chars, so this only matters for ambassador links.
            'referral_code' => ['nullable', 'string', 'max:20']
        ]);

        $refferedBy = User::where('referral_code', $request->referral_code)->first();
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'onboarded' => false,
            'referral_code' => User::generateReferralCode(),
            'accepted_terms' => $request->accepted_terms,
            'referred_by' => $refferedBy ? $refferedBy->id : null
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('onboardingUser');
    }
}