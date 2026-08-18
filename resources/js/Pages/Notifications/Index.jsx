import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function NotificationsIndex({ auth, notifications }) {
    const openNotification = (notification) => {
        if (!notification.read_at) {
            window.axios.post(route('notifications.read', notification.id)).catch(() => {});
        }

        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
    };

    const markAllRead = () => {
        window.axios.post(route('notifications.read-all')).then(() => router.reload({ only: ['notifications'] }));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Notifications" />

            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Notifications</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                        Everything sent to your account
                    </p>
                </div>
                <button
                    onClick={markAllRead}
                    className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-colors"
                >
                    Mark all read
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {notifications.data.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-gray-300 font-black uppercase tracking-widest italic text-sm">
                                No notifications yet
                            </p>
                        </div>
                    ) : (
                        notifications.data.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => openNotification(n)}
                                className={`w-full text-left px-6 py-5 hover:bg-gray-50/50 transition-colors flex gap-4 ${
                                    !n.read_at ? 'bg-brand-50/30' : ''
                                }`}
                            >
                                <span
                                    className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                                        !n.read_at ? 'bg-brand-500' : 'bg-gray-200'
                                    }`}
                                />
                                <span className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-gray-900">{n.data.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{n.data.body}</p>
                                    <p className="text-[10px] text-gray-300 font-bold mt-2 uppercase tracking-widest">
                                        {new Date(n.created_at).toLocaleString('en-NG', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {notifications.links.length > 3 && (
                    <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-center overflow-x-auto gap-2">
                        {notifications.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`shrink-0 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    link.active
                                        ? 'bg-brand-600 text-white shadow-md'
                                        : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
                                } ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
