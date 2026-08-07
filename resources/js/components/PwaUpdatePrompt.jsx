import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Mounted once alongside the Inertia root. No-ops in dev (the plugin only
 * registers a real service worker against production builds). Surfaces a
 * small banner when a newly deployed build is waiting to take over, and lets
 * the visitor apply it on their own schedule rather than force-reloading a
 * page mid wallet/payment flow.
 */
export default function PwaUpdatePrompt() {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisterError(error) {
            console.error('Service worker registration failed:', error);
        },
    });

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 z-[9999] sm:w-80 bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <p className="text-sm font-medium flex-1">A new version is ready.</p>
            <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="text-[10px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 px-3 py-2.5 rounded-xl transition-colors shrink-0"
            >
                Refresh
            </button>
        </div>
    );
}
