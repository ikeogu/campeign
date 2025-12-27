<?php

use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Shared\Controllers\WalletController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('resolve-bank', [WalletController::class, 'resolveBank'])->name('api.bank.resolve');

