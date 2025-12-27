<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasUlids;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'reference',
        'description',
        'metadata',
        'status',
        'channel'
    ];


    protected $casts = [
        'metadata' => 'array'
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}
