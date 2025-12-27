<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PromoterSubmission extends Model
{
    use HasUlids;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'proof_link',
        'status',
        'link',
        'platform'
    ];

    protected $appends = ['full_proof_url'];

    public function getFullProofUrlAttribute()
    {
        if (!$this->proof_link) return null;

        // Checks if the link is already a full URL (like S3) or a local path
        return filter_var($this->proof_link, FILTER_VALIDATE_URL)
            ? $this->proof_link
            : asset('storage/' . $this->proof_link);
    }
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shareLogs(): HasMany
    {
        return $this->hasMany(ShareLog::class);
    }

    public function postVerification(): HasOne
    {
        return $this->hasOne(PostVerification::class);
    }

    public function verification()
    {
        return $this->hasOne(PostVerification::class);
    }

    
    protected static function booted()
    {
        static::created(function ($submission) {
            ShareLog::create([
                'campaign_id' => $submission->campaign_id,
                'promoter_submission_id' => $submission->id,
                'user_id' => $submission->user_id,
                'action'      => 'submitted',
            ]);
            PostVerification::create([
                'user_id'      => $submission->user_id,
                'promoter_submission_id' => $submission->id,
                'status'           => 'pending',
                'checks'           => 0,
            ]);

            
        });
    }
}
