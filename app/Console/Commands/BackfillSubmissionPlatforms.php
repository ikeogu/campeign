<?php

namespace App\Console\Commands;

use App\Models\PromoterSubmission;
use App\Modules\Promoter\Services\PostVerificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackfillSubmissionPlatforms extends Command
{
    protected $signature = 'submissions:backfill-platform {--dry-run : Preview changes without saving them}';

    protected $description = 'Fix promoter_submissions rows where "platform" was accidentally stored '
        . 'as the request array index (e.g. "0", "1") instead of the real platform name, '
        . 're-deriving it from the submitted post link.';

    public function __construct(protected readonly PostVerificationService $verificationService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        // A legitimate platform value is never purely numeric — that's the signature of the bug.
        $corrupted = PromoterSubmission::query()
            ->whereRaw("platform REGEXP '^[0-9]+$'")
            ->get();

        if ($corrupted->isEmpty()) {
            $this->info('No corrupted submissions found. Nothing to do.');
            return self::SUCCESS;
        }

        $this->info(($dryRun ? '[DRY RUN] ' : '') . "Found {$corrupted->count()} submission(s) with an index instead of a platform name.");

        $fixed = 0;
        $unresolved = 0;

        foreach ($corrupted as $submission) {
            $detected = $this->verificationService->detect($submission->link ?? '');

            if (!$detected) {
                $this->warn("  ✗ {$submission->id}: could not detect platform from link '{$submission->link}'. Needs manual review.");
                Log::warning('[BackfillSubmissionPlatforms] Unresolvable', [
                    'submission_id' => $submission->id,
                    'link'          => $submission->link,
                    'old_platform'  => $submission->platform,
                ]);
                $unresolved++;
                continue;
            }

            $this->line("  ✓ {$submission->id}: '{$submission->platform}' → '{$detected}' (from {$submission->link})");

            if (!$dryRun) {
                $submission->update(['platform' => $detected]);
                Log::info('[BackfillSubmissionPlatforms] Fixed', [
                    'submission_id' => $submission->id,
                    'old_platform'  => $submission->platform,
                    'new_platform'  => $detected,
                ]);
            }

            $fixed++;
        }

        $this->line('');
        $this->info(($dryRun ? 'Would fix' : 'Fixed') . ": {$fixed} | Unresolved: {$unresolved}.");

        if ($unresolved > 0) {
            $this->warn('Unresolved rows need a manual look — their link did not match a known platform domain.');
        }

        if ($dryRun && $fixed > 0) {
            $this->line('Re-run without --dry-run to apply these changes.');
        }

        return self::SUCCESS;
    }
}
