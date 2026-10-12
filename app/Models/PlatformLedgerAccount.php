<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The platform's own money, tracked separately from any user's wallet.
 *
 * Two rows exist (see PlatformLedgerService::ACCOUNTS):
 *   - management_fee_revenue: the platform's actual take-home revenue —
 *     credited with the management fee on every campaign funding, debited
 *     whenever a referrer/ambassador is paid out of that fee.
 *   - promoter_payable: money collected that's earmarked for promoters but
 *     not yet paid out — credited with base_budget on funding, debited as
 *     each promoter submission is approved and paid.
 *
 * Everything collected via the payment gateway lands in one external pot
 * (e.g. one Opay purse). These balances tell you how much of that pot is
 * genuinely free to spend vs. still owed to someone.
 */
class PlatformLedgerAccount extends Model
{
    use HasUlids;

    protected $fillable = [
        'key',
        'label',
        'balance',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(PlatformLedgerTransaction::class, 'account_id');
    }
}
