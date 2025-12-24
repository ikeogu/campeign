<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promoter extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'social_handles',
        'platforms',
        'follower_count'
    ];

    protected $casts = [
        'follower_count' => 'integer',
        'social_handles' => 'array',
        'platforms'      => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
