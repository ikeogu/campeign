<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutRequest extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'amount', 'payment_method', 'account_details', 'status', ''
    ];


    public function user() : BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
