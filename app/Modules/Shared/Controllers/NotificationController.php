<?php

namespace App\Modules\Shared\Controllers;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends ApiController
{
    /**
     * Full notification history — the "View all" page.
     */
    public function index()
    {
        $notifications = Auth::user()
            ->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Lightweight JSON endpoint the header bell polls for the unread badge
     * and its dropdown preview. Deliberately separate from index() so
     * polling every ~25s never pulls a full paginated history over the wire.
     */
    public function poll(Request $request)
    {
        $user = Auth::user();

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'recent'       => $user->notifications()->latest()->limit(8)->get(),
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['status' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        Auth::user()->unreadNotifications->markAsRead();

        return response()->json(['status' => true]);
    }
}
