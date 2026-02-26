<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {

        $validatedData = $request->validated();
        $user = $request->user();

        if (isset($validatedData['name']) && $user->promoter) {
            $spliceIfSpace = explode(' ', $validatedData['name'], 2);
            $validatedData['first_name'] = $spliceIfSpace[0];
            $validatedData['last_name'] = $spliceIfSpace[1] ?? '';

            $request->user()->promoter()->update([
                'first_name' => $validatedData['first_name'],
                'last_name' => $validatedData['last_name'],
            ]);
        } else if (isset($validatedData['name']) && $user->campaigner) {
            $request->user()->campaigner()->update([
                'company_name' => $validatedData['name'],
            ]);
        }

        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();



        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $user->wallet->transactions()->delete();
        $user->wallet()->delete();
        $user->campaigns()->delete();
        $user->promoterSubmission()->delete();
        $user->promoter()->delete();
        $user->shareLogs()->delete();
        $user->postVerifications()->delete();
        $user->promoter()->delete();
        $user->delete();
        return Redirect::to('/');
    }

    public function updateUserSocialHandles(Request $request): RedirectResponse
    {
        $request->validate([
            'social_handles' => ['required', 'array'],
            'social_handles.*.platform' => ['required', 'string'],
            'social_handles.*.handle' => ['required', 'string'],
        ]);

        $user = $request->user();

        if ($user->promoter) {
            $user->promoter()->update([
                'social_handles' => $request->input('social_handles'),
                'platforms' => collect($request->input('social_handles'))->pluck('platform')->toArray(),
            ]);

            return back()->with([
                'status' => 'Social handles updated successfully.',
                'message' => 'Social handles updated successfully.', // Add this for backup
            ]);
        }

        return back()->withErrors(['error' => 'Promoter profile not found.']);
    }
}
