<?php

namespace App\Models;

use App\Modules\Campeigner\Notifications\CampaignCompletedNotification;
use App\Modules\Campeigner\Notifications\FundWalletNotification;
use App\Modules\Promoter\Notifications\NewCampaignPublishedNotification;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Notification;

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
        'status',
        'is_trial',
    ];

    protected $casts = [
        'target_shares' => 'integer',
        'platforms' => 'array',
        'is_trial' => 'boolean',
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
            )->where('status', 'approved');
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

    public function getCompletionPercentageAttribute(): float
    {
        if ($this->target_shares <= 0) {
            return 0;
        }

        return round(
            ($this->shares_completed / $this->target_shares) * 100,
            2
        );
    }
    public function getSlotsFilledAttribute(): int
    {
        return $this->target_shares - $this->available_slots;
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

            if (!$campaign->is_trial && $campaign->user->wallet->balance < $campaign->total_budget * 100) {
                $campaign->user->notify(new FundWalletNotification($campaign->user, $campaign));
            }

            // Trial campaigns are created already 'live' (see CampaignController::store),
            // so they never pass through the 'updated' hook below.
            if ($campaign->status === 'live') {
                self::notifyPromotersOfNewCampaign($campaign);
            }
        });

        static::updated(function ($campaign) {
            if ($campaign->status === 'completed') {

                $campaign->user->notify(new CampaignCompletedNotification($campaign));
            }

            // Covers every other path to 'live': gateway charge success,
            // wallet funding, and the admin "Go Live" backoffice action.
            if ($campaign->wasChanged('status') && $campaign->status === 'live') {
                self::notifyPromotersOfNewCampaign($campaign);
            }
        });
    }

    /**
     * Notify every promoter that a new gig is open for submissions.
     * Chunked so this doesn't load the whole promoter table into memory
     * as the platform grows.
     */
    private static function notifyPromotersOfNewCampaign(self $campaign): void
    {
        User::query()
            ->where('role', 'promoter')
            ->chunkById(200, function ($promoters) use ($campaign) {
                Notification::send($promoters, new NewCampaignPublishedNotification($campaign));
            });
    }
}