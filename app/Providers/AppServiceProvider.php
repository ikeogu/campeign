<?php

namespace App\Providers;

use App\Http\Clients\OpayClient;
use App\Interfaces\PaymentGateWayInterface;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {

        app()->bind(
            PaymentGateWayInterface::class,
            fn() => app()->make(OpayClient::class)
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (app()->isProduction()) {
            URL::forceHttps();
        }

        // This is likely breaking Filament's Livewire requests
        // Scope it to only non-admin routes
        /*  if (!request()->is('admin*')) {
            Livewire::setUpdateRoute(function ($handle) {
                return Route::post('/livewire/update', $handle);
            });
        } */

    }
}
