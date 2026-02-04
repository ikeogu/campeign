<?php

namespace App\Models;

use App\Modules\Campeigner\Notifications\CampaignCompletedNotification;
use App\Modules\Campeigner\Notifications\FundWalletNotification;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Campaign extends Model
{

    use HasUlids;


    protected $fillable = [
        'user_id',
        'title',
        'category',
        'description',
        'min_followers',
        'platforms',
        'payout',
        'target_shares',
        'base_budget',
        'management_fee',
        'total_budget',
        'available_slots',
        'status'
    ];

    protected $casts = [
        'target_shares' => 'integer',
        'platforms' => 'array'
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(CampaignMedia::class);
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(PromoterSubmission::class);
    }

    public function payment(): HasOne
    {

        return $this->hasOne(CampaignPayment::class);
    }

    public function payoutsMade() : HasMany
    {
        return $this->hasMany(PromoterEarning::class);
    }

    public function completedPayouts() {
        return $this->payoutsMade()->where('status', 'verified');
    }



    public function verifiedSubmissions()
    {
        return $this->submissions()
            ->whereHas(
                'verification',
                fn($q) =>
                $q->where('status', 'verified')
            );
    }

    public function getSharesCompletedAttribute(): int
    {
        return $this->verifiedSubmissions()->count();
    }

    public function getSharesLeftAttribute(): int
    {
        return max(
            0,
            $this->target_shares - $this->shares_completed
        );
    }


    public function promoterSubmissions()
    {
        return $this->hasMany(PromoterSubmission::class);
    }
    protected static function booted()
    {
        static::created(function ($campaign) {
            $campaign->available_slots = $campaign->target_shares;
            $campaign->save();

            if ($campaign->user->wallet->balance < $campaign->total_budget) {
                $campaign->user->notify(new FundWalletNotification($campaign->user, $campaign));
            }
        });

        static::updated(function ($campaign) {
            if ($campaign->status === 'completed') {

                $campaign->user->notify(new CampaignCompletedNotification($campaign));
            }
        });
    }
}
