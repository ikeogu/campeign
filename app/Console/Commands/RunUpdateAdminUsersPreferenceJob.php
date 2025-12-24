<?php

namespace App\Console\Commands;

use App\Modules\BackOffice\Jobs\UpdateAdminUsersPreferenceJob;
use Illuminate\Console\Command;

class RunUpdateAdminUsersPreferenceJob extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-update-admin-users-preference-job';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        UpdateAdminUsersPreferenceJob::dispatch();
        $this->info('UpdateAdminUsersPreferenceJob dispatched.');
    }
}
