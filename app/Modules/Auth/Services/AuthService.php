<?php

namespace App\Modules\Auth\Services;

use App\Models\Promoter;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthService
{

    public function onboardUser(array $data, User $user)
    {
        // Guards against duplicate profiles from a resubmitted onboarding form
        // (back button, double-click, retried request) — this account already
        // exists as a promoter or campaigner.
        if ($user->onboarded || $user->promoter()->exists() || $user->campaigner()->exists()) {
            throw ValidationException::withMessages([
                'user_type' => 'This account has already completed onboarding.',
            ]);
        }

        return DB::transaction(function () use ($data, $user) {

            $role = '';
            if ($data['user_type'] === 'promoter') {

               // $user->update(['first_name' => $data['first_name'], 'last_name' => $data['last_name']]);
                // Stored in the canonical [{platform, handle}, ...] shape —
                // the registration form still submits two parallel arrays,
                // but everything downstream (profile edits, duplicate
                // checks) expects paired objects, so it's normalized once,
                // here, rather than two different shapes existing in the DB.
                $pairedHandles = Promoter::pairPlatformsAndHandles($data['platforms'], $data['social_handles']);

                $promoter = $user->promoter()->create([
                    'first_name'     => $data['first_name'],
                    'last_name'      => $data['last_name'],
                    'social_handles' => $pairedHandles,
                    'follower_count' => $data['follower_count'],
                    'platforms'      => $data['platforms'],
                ]);
                $promoter->syncSocialHandleRows();
                $role = 'promoter';
            } else {

                //$user->update(['company_name' => $data['company_name']]);
                $user->campaigner()->create([
                    'company_name' => $data['company_name'],
                    'industry'     => $data['industry'],
                    'description'  => $data['description'] ?? null,
                    'website'      => $data['website'] ?? null,
                ]);
                $role = 'campaigner';
            }

            $user->update(['onboarded' => true, 'role' => $role]);

            $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

            return [
                'user'  => $user->fresh(['promoter', 'campaigner']),

            ];
        });
    }

}