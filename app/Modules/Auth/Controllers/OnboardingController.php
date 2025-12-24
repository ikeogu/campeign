<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\ApiController;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Services\AuthService;
use App\Modules\Shared\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class OnboardingController extends ApiController
{

    public function __construct(
        public  readonly AuthService $authService
    ) {}


    public function onboardingUser(){

        return Inertia::render('Onboarding/SelectUserType');
    }

    /**
     * onboardUser A user
     * @param RegisterRequest $register
     *
     */
    public function onboardUser(RegisterRequest $register)
    {
        $user = request()->user();
        $this->authService->onboardUser($register->validated(), $user);

        return redirect()->intended(route('dashboard', absolute: false));
    }




}
