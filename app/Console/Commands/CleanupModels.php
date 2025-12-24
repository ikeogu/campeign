<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;


class CleanupModels extends Command
{
    protected $signature = 'cleanup:models
                          {models?* : Model names to cleanup}
                          {--table= : Specify table name if different from model}
                          {--dry-run : Show what would be done without executing}
                          {--force : Skip confirmation prompts}';

    protected $description = 'Remove unused models, migrations, and database tables';

    public function handle()
    {
        $models = $this->argument('models');
        $models = !empty($models) ? $models : $this->modelsToDelete();
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        if (empty($models)) {
            $this->error('Please specify at least one model to cleanup.');
            return 1;
        }

        $this->info('🔧 Laravel Model Cleanup Tool');
        $this->line('================================');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        foreach ($models as $model) {
            $this->processModel($model, $dryRun, $force);
        }

        $this->displaySummary($dryRun);
        return 0;
    }

    private function processModel($modelName, $dryRun, $force)
    {
        $this->info("\n🔧 Processing: {$modelName}");
        $this->line(str_repeat('-', 40));

        // Determine table name
        $tableName = $this->option('table') ?: $this->getTableName($modelName);

        // Check if model exists
        $modelPath = app_path("Models/{$modelName}.php");
        if (!File::exists($modelPath)) {
            $this->error("❌ Model file not found: {$modelPath}");
        }

        // Find related files
        $relatedFiles = $this->findRelatedFiles($modelName);
        $migrationFile = $this->findMigrationFile($tableName);

        // Show what will be done
        $this->showPlannedActions($tableName, $modelPath, $migrationFile, $relatedFiles);

        // Check for references
        $this->checkReferences($modelName);

        if (!$dryRun) {
            if (!$force && !$this->confirm("Proceed with cleanup for {$modelName}?")) {
                $this->info("Skipped {$modelName}");
                return;
            }

            $this->executeCleanup($modelName, $tableName, $modelPath, $migrationFile, $relatedFiles, $force);
        }
    }

    private function getTableName($modelName)
    {
        $modelClass = "\\App\\Models\\$modelName";

        if (class_exists($modelClass)) {
            if (!is_subclass_of($modelClass, \Illuminate\Database\Eloquent\Model::class)) {
                throw new \InvalidArgumentException("$modelClass is not a valid Eloquent model.");
            }

            return (new $modelClass)->getTable();
        }

        // Fallback: derive table name conventionally (snake plural of class name)
        return Str::snake(Str::pluralStudly(class_basename($modelName)));
    }

    private function findRelatedFiles($modelName)
    {
        $related = [];

        $files = [
            'seeder' => database_path("seeders/{$modelName}Seeder.php"),
            'factory' => database_path("factories/{$modelName}Factory.php"),
            /* 'controller' => app_path("Http/Controllers/{$modelName}Controller.php"),
            'resource_controller' => app_path("Http/Controllers/{$modelName}ResourceController.php"),
            'request' => app_path("Http/Requests/{$modelName}Request.php"),
            'store_request' => app_path("Http/Requests/Store{$modelName}Request.php"),
            'update_request' => app_path("Http/Requests/Update{$modelName}Request.php"), */
        ];

        foreach ($files as $type => $path) {
            if (File::exists($path)) {
                $related[$type] = $path;
            }
        }

        return $related;
    }

    private function findMigrationFile($tableName)
    {
        $migrationPath = database_path('migrations');
        $files = File::allFiles($migrationPath);

        foreach ($files as $file) {
            $contents = File::get($file->getRealPath());

            if (
                Str::contains($contents, "Schema::create('{$tableName}'") ||
                Str::contains($contents, "Schema::table('{$tableName}'")
            ) {
                return $file->getRealPath(); // or $file->getFilename()
            }
        }

        return null;
    }

    private function showPlannedActions($tableName, $modelPath, $migrationFile, $relatedFiles)
    {
        $this->info('📋 Planned Actions:');

        // Check if table exists
        if (Schema::hasTable($tableName)) {
            $this->line("  🗃️  Drop database table: {$tableName}");
        } else {
            $this->warn("  ⚠️  Table '{$tableName}' doesn't exist in database");
        }

        $this->line("  🗑️  Delete model file: {$modelPath}");

        if ($migrationFile) {
            $this->line("  🗑️  Delete original migration: " . basename($migrationFile));
        } else {
            $this->warn("  ⚠️  Original migration not found for: {$tableName}");
        }

        if (!empty($relatedFiles)) {
            $this->info('  📁 Related files found:');
            foreach ($relatedFiles as $type => $path) {
                $this->line("     - {$type}: " . basename($path));
            }
        }
    }

    private function checkReferences($modelName)
    {
        $this->info('🔍 Checking for references...');

        // Search for model references in app directory
        $command = "grep -r '{$modelName}' " . app_path() . " --include='*.php' 2>/dev/null || true";
        $output = shell_exec($command);

        if ($output) {
            $lines = array_filter(explode("\n", trim($output)));
            if (count($lines) > 0) {
                $this->warn("  ⚠️  Found " . count($lines) . " potential references:");
                foreach (array_slice($lines, 0, 3) as $line) {
                    $this->line("     " . trim($line));
                }
                if (count($lines) > 3) {
                    $this->line("     ... and " . (count($lines) - 3) . " more");
                }
            }
        }
    }

    private function executeCleanup($modelName, $tableName, $modelPath, $migrationFile, $relatedFiles, $force)
    {
        $this->info('🚀 Executing cleanup...');

        try {
            Schema::disableForeignKeyConstraints();
            // Create and run drop migration if table exists
            if ($tableName && Schema::hasTable($tableName)) {
                Schema::drop($tableName);
                $this->info("🗑️ Dropped table '{$tableName}'");
            }

            Schema::enableForeignKeyConstraints();

            // Delete model file
            if (File::delete($modelPath)) {
                $this->info("✅ Deleted model file");
            }

            // Delete original migration
            if ($migrationFile && File::delete($migrationFile)) {
                $this->info("✅ Deleted original migration");
            }

            // Delete related files
            foreach ($relatedFiles as $type => $path) {
                if ($force || $this->confirm("Delete {$type} file?")) {
                    if (File::delete($path)) {
                        $this->info("✅ Deleted {$type} file");
                    }
                }
            }

            $this->info("✅ Cleanup completed for {$modelName}");
        } catch (\Exception $e) {
            $this->error("❌ Error during cleanup: " . $e->getMessage());
        }
    }


    private function displaySummary($dryRun)
    {
        $this->info("\n" . str_repeat('=', 40));
        $this->info('📝 Post-cleanup checklist:');
        $this->line('  - Run: composer dump-autoload');
        $this->line('  - Check routes for references');
        $this->line('  - Update DatabaseSeeder if needed');
        $this->line('  - Run your tests');

        if ($dryRun) {
            $this->warn("\n🔍 This was a dry run. Use --force to execute changes.");
        }
    }

    private function modelsToDelete()
    {
        return [
            'AccountNameEnquiry',
            'AccountTier',
            'AccountTierCurrencyLimit',
            'AccountType',
            'Announcement',
            'AuditLogs',
            'BaniPayment',
            'ChatUser',
            'FavoriteDeals',
            'Feedback',
            'Friend',
            'IncomeBand',
            'KycBvn',
            'KycStep',
            'KYCDocuments',
            'KycNin',
            'MarketDealRequests',
            'MarketPlaceRequests',
            'MarketPlaceDeals',
            'Message',
            'ModularCallBack',
            'ModularCallback',
            "ModularWebHook",
            "ModuleSetting",
            "ProofOfAddressType",
            "Refferal",
            "ReferralCredit",
            "ReferralCreditTransaction",
            "RefferalCompensation",
            "ServiceCharge",
            "SourceOfIncome",
            "Ticket",
            "TicketMessage",
            "Tickets",
            "TicketSubject",
            "TransactionCharge",
            "TransactionStatement",
            "UnprocessedInflow",
            "UserBankAccounts",
            "UserModularWebhook",
            "UserModularWebHook",
            "UserOldPassword",
            "UserWallet",
            "UserWallets",
            "WalletDeposits",
            "WalletLimit",
            "WalletTransactions",
            "WalletTransfers",
            "KycNIns"
        ];
    }


    // Run the Following Commands
    /**
     * php artisan cleanup:models --force
     * # Dry run to see what would happen
     * php artisan cleanup:models --dry-run

     *     # Actually execute the cleanup
     *     php artisan cleanup:models User Post

     *  # Force execution without prompts
     *    php artisan cleanup:models User Post --force

     *  # Specify custom table name
     *   php artisan cleanup:models User --table=custom_users_table
     */
}