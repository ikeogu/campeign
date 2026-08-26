import Dropdown from '@/Components/Dropdown';
import { Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 25000;

function timeAgo(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [recent, setRecent] = useState([]);
    const fetchedOnce = useRef(false);

    const poll = useCallback(() => {
        window.axios
            .get(route('notifications.poll'))
            .then(({ data }) => {
                setUnreadCount(data.unread_count);
                setRecent(data.recent);
            })
            .catch(() => {
                // Silent — the bell just keeps its last known state until the next poll.
            });
    }, []);

    useEffect(() => {
        poll();
        fetchedOnce.current = true;
        const interval = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [poll]);

    const openNotification = (notification) => {
        if (!notification.read_at) {
            window.axios.post(route('notifications.read', notification.id)).catch(() => {});
            setRecent((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((count) => Math.max(0, count - 1));
        }

        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
    };

    const markAllRead = (e) => {
        e.stopPropagation();
        window.axios
            .post(route('notifications.read-all'))
            .then(() => {
                setUnreadCount(0);
                setRecent((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
            })
            .catch(() => {});
    };

    return (
        <Dropdown align="right" width="notif">
            <Dropdown.Trigger>
                <button className="relative w-10 h-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 hover:bg-brand-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </Dropdown.Trigger>

            {/*
                The panel is much wider than the bell it opens from, so
                anchoring it to the bell's own ~40px box (the Dropdown
                default) leaves it floating detached from everything below
                sm — it just doesn't have 320px of clear room to grow into.
                Below sm it's pinned to the viewport instead, as a sheet
                under the header; at sm and up there's enough room for the
                normal trigger-relative right-aligned panel.
            */}
            <Dropdown.Content
                contentClasses="py-0 bg-white"
                panelClassName="fixed z-50 inset-x-4 top-24 rounded-md shadow-lg sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2"
            >
                <div className="w-full sm:w-80">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-900">Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-bold text-brand-600 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {recent.length === 0 ? (
                            <p className="px-4 py-10 text-center text-xs text-gray-400 font-bold">
                                No notifications yet
                            </p>
                        ) : (
                            recent.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => openNotification(n)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${
                                        !n.read_at ? 'bg-brand-50/40' : ''
                                    }`}
                                >
                                    <span
                                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                            !n.read_at ? 'bg-brand-500' : 'bg-gray-200'
                                        }`}
                                    />
                                    <span className="min-w-0">
                                        <p className="text-xs font-black text-gray-900 truncate">
                                            {n.data.title}
                                        </p>
                                        <p className="text-[11px] text-gray-500 line-clamp-2">{n.data.body}</p>
                                        <p className="text-[10px] text-gray-300 font-bold mt-1">
                                            {timeAgo(n.created_at)}
                                        </p>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    <Link
                        href={route('notifications.index')}
                        className="block text-center py-3 text-[10px] font-black uppercase tracking-widest text-brand-600 hover:bg-gray-50 border-t border-gray-100"
                    >
                        View all
                    </Link>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
