<?php

namespace App\Modules\Shared\Services;

use App\Models\Campaign;
use App\Models\PlatformLedgerAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * The platform's own ledger — separate from any user's wallet — so it's
 * possible to answer "of everything sitting in our one payment-gateway
 * purse right now, how much is genuinely ours vs. still owed to someone."
 *
 * Two accounts, defined once here:
 *   - management_fee_revenue: the platform's actual take-home revenue.
 *   - promoter_payable: money collected but earmarked for promoters who
 *     haven't been paid yet — this is NOT the platform's money, even
 *     though it sits in the same external account until paid out.
 */
class PlatformLedgerService
{
    public const MANAGEMENT_FEE_REVENUE = 'management_fee_revenue';
    public const PROMOTER_PAYABLE = 'promoter_payable';

    private const LABELS = [
        self::MANAGEMENT_FEE_REVENUE => 'Management Fee Revenue',
        self::PROMOTER_PAYABLE => 'Promoter Payable',
    ];

    /**
     * Record a campaign's funding: the management fee becomes platform
     * revenue, and base_budget becomes money earmarked for promoters.
     * Idempotent — safe to call more than once for the same campaign
     * (e.g. a retried webhook); only runs once, guarded by
     * campaign.ledger_recorded_at.
     */
    public function recordCampaignFunding(Campaign $campaign): void
    {
        if ($campaign->ledger_recorded_at !== null) {
            return;
        }

        $feeKobo  = (int) round((float) ($campaign->management_fee ?? 0) * 100);
        $baseKobo = (int) round((float) ($campaign->base_budget ?? 0) * 100);

        DB::transaction(function () use ($campaign, $feeKobo, $baseKobo) {
            // Re-check inside the transaction to close the race between the
            // check above and this write.
            $fresh = Campaign::whereKey($campaign->id)->lockForUpdate()->first();
            if (! $fresh || $fresh->ledger_recorded_at !== null) {
                return;
            }

            if ($feeKobo > 0) {
                $this->credit(
                    self::MANAGEMENT_FEE_REVENUE,
                    $feeKobo,
                    channel: 'campaign_funding',
                    description: "Management fee collected — campaign \"{$campaign->title}\"",
                    campaign: $campaign,
                );
            }

            if ($baseKobo > 0) {
                $this->credit(
                    self::PROMOTER_PAYABLE,
                    $baseKobo,
                    channel: 'campaign_funding',
                    description: "Promoter budget reserved — campaign \"{$campaign->title}\"",
                    campaign: $campaign,
                );
            }

            $fresh->update(['ledger_recorded_at' => now()]);
        });
    }

    public function credit(string $accountKey, int $kobo, string $channel, string $description, ?Campaign $campaign = null, ?array $metadata = null): void
    {
        $this->move('credit', $accountKey, $kobo, $channel, $description, $campaign, $metadata);
    }

    public function debit(string $accountKey, int $kobo, string $channel, string $description, ?Campaign $campaign = null, ?array $metadata = null): void
    {
        $this->move('debit', $accountKey, $kobo, $channel, $description, $campaign, $metadata);
    }

    private function move(string $type, string $accountKey, int $kobo, string $channel, string $description, ?Campaign $campaign, ?array $metadata): void
    {
        if ($kobo <= 0) {
            return;
        }

        DB::transaction(function () use ($type, $accountKey, $kobo, $channel, $description, $campaign, $metadata) {
            $account = $this->lockAccount($accountKey);

            if ($type === 'debit' && $account->balance < $kobo) {
                // Not blocked — the platform's payment to a referrer is
                // still real money it owes regardless of what this ledger
                // currently shows — but it means the ledger has drifted
                // from reality somewhere and needs attention.
                Log::warning('Platform ledger account going negative', [
                    'account' => $accountKey,
                    'balance' => $account->balance,
                    'debit'   => $kobo,
                ]);
            }

            $account->update([
                'balance' => $type === 'credit'
                    ? $account->balance + $kobo
                    : $account->balance - $kobo,
            ]);

            $account->transactions()->create([
                'type'        => $type,
                'amount'      => $kobo,
                'channel'     => $channel,
                'description' => $description,
                'campaign_id' => $campaign?->id,
                'reference'   => 'LGR-' . Str::upper(Str::random(12)),
                'metadata'    => $metadata,
            ]);
        });
    }

    private function lockAccount(string $key): PlatformLedgerAccount
    {
        $account = PlatformLedgerAccount::where('key', $key)->lockForUpdate()->first();

        if (! $account) {
            // firstOrCreate isn't safe under a row lock race; create then
            // re-fetch with the lock if two requests hit this at once.
            $account = PlatformLedgerAccount::firstOrCreate(
                ['key' => $key],
                ['label' => self::LABELS[$key] ?? $key, 'balance' => 0],
            );
            $account = PlatformLedgerAccount::where('key', $key)->lockForUpdate()->first();
        }

        return $account;
    }
}
