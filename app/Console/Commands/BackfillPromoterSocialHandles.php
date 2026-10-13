<?php

namespace App\Console\Commands;

use App\Models\Promoter;
use App\Models\PromoterSocialHandle;
use Illuminate\Console\Command;

class BackfillPromoterSocialHandles extends Command
{
    protected $signature   = 'promoters:backfill-social-handles';
    protected $description = 'Populate promoter_social_handles from existing Promoter.social_handles data, and deactivate every duplicate account found (same handle already claimed by an earlier-registered promoter).';

    public function handle(): int
    {
        $promoters = Promoter::with('user')->get();

        if ($promoters->isEmpty()) {
            $this->info('No promoters to process.');
            return self::SUCCESS;
        }

        // Flatten every promoter's handles into one list of candidate rows,
        // oldest promoter first — the first one to claim a given
        // (platform, normalized_handle) keeps it; everyone after is a
        // duplicate.
        $candidates = $promoters
            ->sortBy(fn (Promoter $p) => $p->created_at)
            ->flatMap(function (Promoter $promoter) {
                return collect($this->canonicalPairs($promoter))
                    ->map(fn ($pair) => [
                        'promoter'   => $promoter,
                        'platform'   => strtolower(trim($pair['platform'])),
                        'handle'     => $pair['handle'],
                        'normalized' => PromoterSocialHandle::normalizeHandle($pair['platform'], $pair['handle']),
                    ]);
            })
            ->filter(fn ($row) => $row['platform'] !== '' && $row['normalized'] !== '');

        $groups = $candidates->groupBy(fn ($row) => $row['platform'] . '|' . $row['normalized']);

        $claimed = 0;
        $deactivated = 0;

        foreach ($groups as $key => $rows) {
            // Oldest promoter in this group wins the handle (list is
            // already oldest-first from the sortBy above).
            $owner = $rows->first();

            PromoterSocialHandle::firstOrCreate(
                [
                    'platform'          => $owner['platform'],
                    'normalized_handle' => $owner['normalized'],
                ],
                [
                    'promoter_id' => $owner['promoter']->id,
                    'handle'      => $owner['handle'],
                ],
            );
            $claimed++;

            foreach ($rows->skip(1) as $duplicate) {
                $user = $duplicate['promoter']->user;

                if (! $user || ! $user->is_active) {
                    continue; // already deactivated, or no user to deactivate
                }

                $user->deactivate(
                    admin: null,
                    reason: "Duplicate social profile — \"{$duplicate['handle']}\" on {$duplicate['platform']} is already "
                        . "registered to {$owner['promoter']->user?->email} (account created earlier).",
                );
                $deactivated++;

                $this->line("  ⚠ Deactivated {$user->email} — duplicate {$duplicate['platform']} handle \"{$duplicate['handle']}\" (owned by {$owner['promoter']->user?->email})");
            }
        }

        $this->info("Done. Claimed {$claimed} unique handle(s) across " . $groups->count() . ' group(s); deactivated ' . $deactivated . ' duplicate account(s).');

        return self::SUCCESS;
    }

    /**
     * Returns [{platform, handle}, ...] for a promoter regardless of which
     * historical shape its social_handles column is in — old registrations
     * stored a flat array of strings (paired with the parallel `platforms`
     * column by index), newer data (and anything saved after this fix) is
     * already [{platform, handle}, ...].
     */
    private function canonicalPairs(Promoter $promoter): array
    {
        $handles = $promoter->social_handles ?? [];

        if (empty($handles)) {
            return [];
        }

        $firstEntry = reset($handles);
        if (is_array($firstEntry) && isset($firstEntry['platform'], $firstEntry['handle'])) {
            return $handles;
        }

        // Legacy flat-string shape — pair with the parallel platforms[].
        return Promoter::pairPlatformsAndHandles($promoter->platforms ?? [], $handles);
    }
}
