<?php

use App\Http\Controllers\ProfileController;
use App\Models\Campaign;
use App\Modules\Auth\Controllers\OnboardingController;
use App\Modules\Campeigner\Controllers\CampaignController;
use App\Modules\Promoter\Controllers\PromoterEarningsController;
use App\Modules\Promoter\Controllers\PromoterGigController;
use App\Modules\Shared\Controllers\DashboardController;
use App\Modules\Shared\Controllers\WalletController;
use App\Modules\Shared\Services\CampaignService;
use App\Modules\Shared\Services\PaymentService;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {

    $gigs = app(CampaignService::class)->fetchLiveCampaigns(5);
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'liveGigs' => $gigs
    ]);
});

Route::get('/terms', function () {

    return Inertia::render('Terms');
})->name('terms');

Route::get('guest-gigs', [PromoterGigController::class, 'guestIndex'])->name('guest.gigs');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/user-onboarding',  function () {
        return Inertia::render('Onboarding/SelectUserType');
    })->name('onboardingUser');
    Route::get('/promoter',  function () {
        return Inertia::render('Onboarding/PromoterForm');
    })->name('onboarding.promoter');
    Route::get('/advertizer',  function () {
        return Inertia::render('Onboarding/AdvertizerForm');
    })->name('onboarding.advertiser');

    Route::post('/onboarding/save-user', [OnboardingController::class, 'onboardUser'])
        ->name('onboarding.save.user');

    Route::prefix('advertiser/campaigns')->controller(CampaignController::class)->group(function () {

        Route::get('', 'index')->name('campaigns.index');
        Route::get('/create', 'create')->name('campaigns.create');
        Route::post('', 'store')->name('campaigns.store');
        Route::get('/{campaign}/edit', 'edit')->name('campaigns.edit');
        Route::post('/{campaign}', 'update')->name('campaigns.update');
        Route::delete('/{campaign}', 'destroy')->name('campaigns.destroy');
        Route::get('{campaign}/fund', 'fundCampaign')->name('campaigns.fund');
        Route::post('{campaign}/process_funding', 'processFunding')->name('campaigns.process_funding');
        Route::get('promoter/submissions/{campaign}', 'promoterSubmissions')->name('campaigns.submissions.index');
    });

    Route::prefix('promoter/gigs')->controller(PromoterGigController::class)->group(function () {
        Route::get('', 'index')
            ->name('promoter.gigs.index');

        // Promoter: View single gig
        Route::get('{id}', 'show')
            ->name('promoter.gigs.show');

        // Promoter: Download image(s)
        Route::get('{id}/download/{imageId}', 'download')
            ->name('promoter.gigs.download');

        // Promoter: Submit post link
        Route::get('{id}/submit', 'submitPage')
            ->name('promoter.gigs.submit');

        Route::post('{id}/submit', 'storeSubmission')
            ->name('promoter.gigs.submit.store');
    });

    Route::get('promoter/earnings', [PromoterEarningsController::class, 'index'])
        ->name('promoter.earnings.index');

    Route::get('submissions', [PromoterEarningsController::class, 'submissions'])
        ->name('promoter.submissions');

    Route::get('wallet', [WalletController::class, 'index'])
        ->name('wallet.index');

    Route::get('wallet-top-up', [WalletController::class, 'fundWallet'])->name('wallet-fund');
    Route::post('wallet-fund-initialize', [WalletController::class, 'initialize'])->name('wallet.fund.initialize');
    Route::get('withdraw-create', [WalletController::class, 'withdraw'])->name('withdraw.create');
    Route::post('payout', [WalletController::class, 'payout'])->name('withdraw.store');
    Route::get('/promoter-analysis', [DashboardController::class, 'promoterAnalysis'])->name('promoter.analytics');
});

Route::get('/dashboard', [DashboardController::class, 'dashboard'])->middleware(['auth', 'verified', 'onboarded'])->name('dashboard');

Route::webhooks('webhook/paystack', 'paystack');

Route::get('test-fund', function () {
    $jsonString = '{"event":"charge.success","data":{"id":5677225640,"domain":"test","status":"success","reference":"WAL-ATM165GM3B","amount":500000,"message":null,"gateway_response":"Successful","paid_at":"2025-12-27T10:59:52.000Z","created_at":"2025-12-27T10:59:43.000Z","channel":"card","currency":"NGN","ip_address":"105.112.90.140","metadata":{"referrer":"http://127.0.0.1:8000/"},"fees_breakdown":null,"log":null,"fees":17500,"fees_split":null,"authorization":{"authorization_code":"AUTH_qqt7hejxfw","bin":"408408","last4":"4081","exp_month":"12","exp_year":"2030","channel":"card","card_type":"visa ","bank":"TEST BANK","country_code":"NG","brand":"visa","reusable":true,"signature":"SIG_fXQ7MYtqD5ZwRH7vwmbl","account_name":null,"receiver_bank_account_number":null,"receiver_bank":null},"customer":{"id":328458431,"first_name":null,"last_name":null,"email":"cedarbuds@gmail.com","customer_code":"CUS_pk6nepbgfs9jubb","phone":null,"metadata":null,"risk_action":"default","international_format_phone":null},"plan":{},"subaccount":{},"split":{},"order_id":null,"paidAt":"2025-12-27T10:59:52.000Z","requested_amount":500000,"pos_transaction_data":null,"source":{"type":"api","source":"merchant_api","entry_point":"transaction_initialize","identifier":null}}}';

    $data = json_decode($jsonString);

    app(PaymentService::class)->verifyPayment($data->data->reference, $data->data->channel);
});
require __DIR__ . '/auth.php';
