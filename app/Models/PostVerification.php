<?php

namespace App\Models;

use App\Modules\Promoter\Services\PostVerificationService;
use Illuminate\Database\Eloquent\Model;

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

    public function promoterSubmission()
    {
        return $this->belongsTo(PromoterSubmission::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::created(function ($verification) {

            app(PostVerificationService::class)->start($verification->promoterSubmission->link, $verification);
        });

        static::updated(function ($verification) {
            if ($verification->status === 'verified') {
                app(PostVerificationService::class)->rewardPromoter($verification);
            }
        });
    }
}
