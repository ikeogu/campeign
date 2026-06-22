<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycVerification extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'status', 'id_type', 'id_number', 'verified_name',
        'name_match_score', 'admin_note', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function setIdNumberAttribute(string $value): void
    {
        $this->attributes['id_number'] = encrypt($value);
    }

    public function getIdNumberAttribute(string $value): string
    {
        try {
            return decrypt($value);
        } catch (\Throwable) {
            return '***';
        }
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
