<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignMedia extends Model
{
    use HasUlids;

    protected $fillable = [
        'file_path','campaign_id'
    ];

    public function campaign() : BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
