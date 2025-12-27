<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ShareLog extends Model
{
    use HasUlids;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'promoter_submission_id',
        'shared_at',
        'earned_amount',
        'action'
    ];


    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function promoterSubmission(): BelongsTo
    {
        return $this->belongsTo(PromoterSubmission::class);
    }

    public function promoterEarning(): HasOne
    {
        return $this->hasOne(PromoterEarning::class);
    }

    protected static function booted()
    {

        static::created(function ($shareLog) {
            $shareLog->promoterEarning()->create([
                'promoter_id' => $shareLog->user->promoter->id,
                'campaign_id' => $shareLog->campaign_id,
                'amount' => $shareLog->campaign->payout,
                'status' => 'pending',
                'completed_at' => now()
            ]);
        });
        static::updated(function ($shareLog) {

            if ($shareLog->isDirty('action') && $shareLog->action === 'verified') {
                $shareLog->promoterEarning()->update(['status' => 'completed', 'completed_at' => now()]);
            }
        });
    }
}
