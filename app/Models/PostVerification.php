<?php

namespace App\Models;

use App\Modules\Promoter\Services\PostVerificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostVerification extends Model
{
    protected $fillable = [
        'user_id',
        'promoter_submission_id',
        'first_verified_at',
        'last_checked_at',
        'status',
        'checks',
    ];

    protected $casts = [
        'first_verified_at' => 'datetime',
        'last_checked_at' => 'datetime',
    ];

    public function promoterSubmission(): BelongsTo
    {
        return $this->belongsTo(PromoterSubmission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::created(function ($verification) {

            app(PostVerificationService::class)->start($verification);
        });

        static::updating(function ($verification) {
            if ($verification->isDirty('first_verified_at') && $verification->first_verified_at !== null) {
                app(PostVerificationService::class)->initiatePendingPayout($verification);
            }
        });

        // Use 'updated' for after-save logic
        static::updated(function ($verification) {
            if ($verification->status === 'verified') {

            }
        });
    }
}
