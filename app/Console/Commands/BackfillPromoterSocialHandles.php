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

        $repaired = 0;

        // Repair any promoter whose social_handles/platforms aren't already
        // in the canonical shape — including the double-JSON-encoded rows
        // left behind by a since-fixed bug in the registration path, where
        // $promoter->social_handles comes back as a STRING, not an array.
        // Fixing the stored data here (not just reading around it) means
        // every other place in the app that reads these columns is correct
        // too, not just this command.
        foreach ($promoters as $promoter) {
            $pairs = $this->canonicalPairs($promoter);
            $alreadyCanonical = is_array($promoter->social_handles) && $promoter->social_handles === $pairs;

            if (! $alreadyCanonical) {
                $promoter->update([
                    'social_handles' => $pairs,
                    'platforms'      => collect($pairs)->pluck('platform')->unique()->values()->all(),
                ]);
                $repaired++;
            }
        }

        if ($repaired > 0) {
            $this->info("Repaired {$repaired} promoter(s) whose social_handles/platforms were stored in a broken or legacy shape.");
        }

        // Flatten every promoter's (now-canonical) handles into one list of
        // candidate rows, oldest promoter first — the first one to claim a
        // given (platform, normalized_handle) keeps it; everyone after is a
        // duplicate.
        $candidates = $promoters
            ->sortBy(fn (Promoter $p) => $p->created_at)
            ->flatMap(function (Promoter $promoter) {
                return collect($promoter->social_handles ?? [])
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
     * historical shape its social_handles column is in:
     *   - already [{platform, handle}, ...] (current, canonical shape)
     *   - a flat array of strings, paired with the parallel `platforms`
     *     column by index (old registrations, before this fix)
     *   - a JSON-encoded STRING instead of an array — the registration path
     *     used to call json_encode() on a value already headed into a
     *     column cast as 'array', double-encoding it. The cast's single
     *     json_decode() only undoes one layer, so $promoter->social_handles
     *     comes back as a plain string in that case, not an array.
     */
    private function canonicalPairs(Promoter $promoter): array
    {
        $handles = $this->decodeMaybeDoubleEncoded($promoter->social_handles);
        $platforms = $this->decodeMaybeDoubleEncoded($promoter->platforms);

        if (empty($handles)) {
            return [];
        }

        $firstEntry = reset($handles);
        if (is_array($firstEntry) && isset($firstEntry['platform'], $firstEntry['handle'])) {
            return $handles;
        }

        // Legacy flat-string shape — pair with the parallel platforms[].
        return Promoter::pairPlatformsAndHandles($platforms, $handles);
    }

    /**
     * $value is normally already an array (decoded once by the model's
     * 'array' cast). If the raw column was double-JSON-encoded, the cast's
     * single decode leaves a JSON string behind instead — decode it again
     * in that case. Anything else unexpected becomes an empty array rather
     * than blowing up the whole backfill run.
     */
    private function decodeMaybeDoubleEncoded(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }
}
