<?php

namespace App\Providers;

use App\Http\Clients\OpayClient;
use Illuminate\Support\ServiceProvider;

class OpayProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(OpayClient::class, function () {
            return new OpayClient();
        });
    }

    public function boot(): void {}
}
