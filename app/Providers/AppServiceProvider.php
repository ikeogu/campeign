<?php

namespace App\Providers;

use App\Http\Clients\PaystackClient;
use App\Interfaces\PaymentGateWayInterface;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        app()->bind(
            PaymentGateWayInterface::class,
            function () {
                // $paymentGateway = config('services.payment_gateway');
                return app()->make(PaystackClient::class);
                /* return match ($paymentGateway) {
                   /// 'paystack' => app()->make(PaystackClient::class),
                  //  'flutter' => app()->make(FlutterWaveClient::class),
                    default  => app()->make(PaystackClient::class),
                }; */
            }
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
    }
}
