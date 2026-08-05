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

    /**
     * No mime/type column exists on this table — uploads are validated against
     * mimes:jpg,jpeg,png,mp4,mov,avi,webm at request time (CampaignController)
     * but that isn't persisted, so the file extension is the only signal left
     * once it's saved. Single source of truth so callers don't each re-guess.
     */
    public function getIsVideoAttribute(): bool
    {
        $extension = strtolower(pathinfo($this->file_path ?? '', PATHINFO_EXTENSION));

        return in_array($extension, ['mp4', 'mov', 'avi', 'webm'], true);
    }
}
