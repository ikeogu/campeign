<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoterEarning extends Model
{
    use HasUlids;

    protected $fillable = [
        'promoter_id', 'campaign_id', 'amount',
        'status', 'completed_at', 'share_log_id'
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
    
}
