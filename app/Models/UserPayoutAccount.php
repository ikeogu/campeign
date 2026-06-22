<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPayoutAccount extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'bank_code', 'bank_name', 'account_number',
        'account_name', 'change_requested_at',
    ];

    protected $casts = [
        'change_requested_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
