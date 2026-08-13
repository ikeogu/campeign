<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    /**
     * Blocks a deactivated user from every authenticated action (submissions,
     * withdrawals, campaign management, etc.) and shows them the deactivation
     * notice instead — mirroring how OnboardedMiddleware intercepts requests.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = Auth::user();

        if ($user && ! $user->is_active) {
            return Inertia::render('Account/Deactivated', [
                'reason' => $user->deactivation_reason,
                'deactivatedAt' => $user->deactivated_at?->toIso8601String(),
            ]);
        }

        return $next($request);
    }
}
