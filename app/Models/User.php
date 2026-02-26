<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Filament\Models\Contracts\FilamentUser;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasUlids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [

        'email',
        'role',
        'password',
        'onboarded',
        'accepted_terms',
        'referral_code',
        'referred_by',
        'first_name',
        'last_name',
        'company_name'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'onboarded' => 'boolean'
        ];
    }


    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        return $this->role === 'admin'; // or role check
    }
    public function promoter(): HasOne
    {
        return $this->hasOne(Promoter::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function campaigner(): HasOne
    {
        return $this->hasOne(Campaigner::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function shareLogs(): HasMany
    {
        return $this->hasMany(ShareLog::class);
    }

    public function postVerifications(): HasMany
    {
        return $this->hasMany(PostVerification::class);
    }

    public function promoterSubmission(): HasMany
    {
        return $this->hasMany(PromoterSubmission::class);
    }

    public function referrals()
    {
        // Assuming you added 'referred_by' column to the users table
        return $this->hasMany(User::class, 'referred_by');
    }

    public function getNameAttribute()
    {
        if ($this->promoter) {
            return $this->promoter->first_name . ' ' . $this->promoter->last_name;
        } elseif ($this->campaigner) {
            return $this->campaigner->company_name;
        }
        return null;
    }
}
