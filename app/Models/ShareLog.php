<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
