<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthService
{

    public function onboardUser(array $data, User $user)
    {
        return DB::transaction(function () use ($data, $user) {

            $role = '';
            if ($data['user_type'] === 'promoter') {

                $user->promoter()->create([
                    'first_name'     => $data['first_name'],
                    'last_name'      => $data['last_name'],
                    'social_handles' => json_encode($data['social_handles']),
                    'follower_count' => $data['follower_count'],
                    'platforms'      => json_encode($data['platforms']),
                ]);
                $role = 'promoter';
            } else {

                $user->campaigner()->create([
                    'company_name' => $data['company_name'],
                    'industry'     => $data['industry'],
                    'description'  => $data['description'] ?? null,
                    'website'      => $data['website'] ?? null,
                ]);
                $role = 'campaigner';
            }

            $user->update(['onboarded' => true, 'role' => $role]);

            $user->wallet()->create(['balance' => 0]);

            return [
                'user'  => $user->fresh(['promoter', 'campaigner']),

            ];
        });
    }

}
