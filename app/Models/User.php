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
        'company_name',
        'is_active',
        'deactivated_at',
        'deactivation_reason',
        'deactivated_by',
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
            'onboarded' => 'boolean',
            'is_active' => 'boolean',
            'deactivated_at' => 'datetime',
        ];
    }


    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        return $this->role === 'admin' && $this->is_active; // or role check
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
        return $this->hasMany(User::class, 'referred_by');
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * Generate a referral code guaranteed to be unique among existing users.
     * Shared by registration (RegisteredUserController) and the
     * users:backfill-referral-codes command so every account ends up with one.
     */
    public static function generateReferralCode(): string
    {
        do {
            $code = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 6);
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    public function kyc(): HasOne
    {
        return $this->hasOne(KycVerification::class);
    }

    public function payoutAccount(): HasOne
    {
        return $this->hasOne(UserPayoutAccount::class);
    }

    public function deactivatedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'deactivated_by');
    }

    public function deactivate(?User $admin = null, ?string $reason = null): void
    {
        $this->update([
            'is_active' => false,
            'deactivated_at' => now(),
            'deactivation_reason' => $reason,
            'deactivated_by' => $admin?->id,
        ]);
    }

    public function reactivate(): void
    {
        $this->update([
            'is_active' => true,
            'deactivated_at' => null,
            'deactivation_reason' => null,
            'deactivated_by' => null,
        ]);
    }

    public function getNameAttribute()
    {
        if ($this->promoter) {
            return $this->promoter->first_name . ' ' . $this->promoter->last_name;
        } elseif ($this->campaigner) {
            return $this->campaigner->company_name;
        }
        return "Superstar Admin";
    }
}
