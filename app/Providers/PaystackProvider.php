<?php

namespace App\Providers;

use App\Http\Clients\PaystackClient;
use Illuminate\Support\ServiceProvider;
use App\Traits\GuzzleLogger;

class PaystackProvider extends ServiceProvider
{
    use GuzzleLogger;
    /**
     * Register services.
     */
    public function register(): void
    {
       // $stack =  $this->createHandlerStack();
        $this->app->singleton(PaystackClient::class, function () {
            $client =  new PaystackClient();

            $client->baseUrl(config('services.paystack.base_url'))
                ->withHeaders([
                    'Authorization' => 'Bearer ' . config('services.paystack.secret_key'),
                    'Content-Type' => 'application/json',
                ]);
                //->withOptions(['handler' => $stack]);

            return $client;
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
