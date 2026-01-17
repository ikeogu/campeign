<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignPayment extends Model
{
    use HasUlids;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'reference',
        'amount',
        'status',
        'channel',
        'gateway_data',
        'paid_at'
    ];


    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
