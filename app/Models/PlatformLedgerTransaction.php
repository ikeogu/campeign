<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformLedgerTransaction extends Model
{
    use HasUlids;

    protected $fillable = [
        'account_id',
        'type',
        'amount',
        'channel',
        'description',
        'campaign_id',
        'reference',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(PlatformLedgerAccount::class, 'account_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
