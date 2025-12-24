<?php

use App\Http\Controllers\ProfileController;
use App\Modules\Auth\Controllers\OnboardingController;
use App\Modules\Campeigner\Controllers\CampaignController;
use App\Modules\Promoter\Controllers\PromoterEarningsController;
use App\Modules\Promoter\Controllers\PromoterGigController;
use App\Modules\Shared\Controllers\WalletController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

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
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'user' => Auth::user(),
    ]);
})->middleware(['auth', 'verified', 'onboarded'])->name('dashboard');



require __DIR__ . '/auth.php';
