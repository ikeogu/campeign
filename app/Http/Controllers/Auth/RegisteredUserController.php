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
            'referral_code' => ['nullable', 'string', 'max:8']
        ]);

        Log::info('Register data received:', $request->all());

        $refferedBy = User::where('referral_code', $request->referral_code)->first();
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'onboarded' => false,
            'referral_code' => $this->generateReferralCode(),
            'accepted_terms' => $request->accepted_terms,
            'referred_by' => $refferedBy ? $refferedBy->id : null
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('onboardingUser');
    }


    public function generateReferralCode(): string
    {
        do {
            $code = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 6);
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}
