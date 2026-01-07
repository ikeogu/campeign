import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ThemedNavLink from '@/Components/ThemedNavLink'

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isPromoter = user.role === 'promoter';
    const isAdvertiser = user.role === 'campaigner';

    return (
        <div className="min-h-screen bg-[#FDF2F8] flex flex-col sm:flex-row">

            {/* --- MOBILE SIDEBAR OVERLAY --- */}
            <div
                className={`fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* --- SIDEBAR (Hidden on Mobile unless toggled) --- */}
            <aside className={`
                fixed z-[60] inset-y-0 left-0 w-72 bg-white transform transition-all duration-500 ease-in-out border-r border-pink-100
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                sm:translate-x-0 sm:static sm:h-screen
            `}>
                <div className="p-8 border-b border-pink-50">
                    <Link href="/" className="flex items-center gap-3">
                        <ApplicationLogo className="h-10 w-auto text-pink-600" />
                        <span className="font-black text-2xl tracking-tighter text-gray-900">Gigs&Campgs<span className="text-pink-600">.</span></span>
                    </Link>
                </div>

                <nav className="p-6 space-y-2 overflow-y-auto h-[calc(100vh-120px)] scrollbar-hide">
                    <ThemedNavLink href={route('dashboard')} active={route().current('dashboard')} icon="🏠">
                        Dashboard
                    </ThemedNavLink>

                    {isPromoter && (
                        <div className="pt-6 space-y-2">
                            <p className="px-4 text-[10px] font-black uppercase text-pink-400 tracking-[0.2em] mb-4">Promoter Tools</p>
                            <ThemedNavLink href={route('promoter.gigs.index')} active={route().current('promoter.gigs.index')} icon="⚡">Gigs Grid</ThemedNavLink>
                            <ThemedNavLink href={route('promoter.analytics')} active={route().current('promoter.analytics')} icon="⚡">Analytics</ThemedNavLink>
                            <ThemedNavLink href={route('promoter.submissions')} active={route().current('promoter.submissions')} icon="📸">My Shares</ThemedNavLink>
                            <ThemedNavLink href={route('wallet.index')} active={route().current('wallet.index')} icon="💰">Wallet</ThemedNavLink>
                        </div>
                    )}

                    {isAdvertiser && (
                        <div className="pt-6 space-y-2">
                            <p className="px-4 text-[10px] font-black uppercase text-green-500 tracking-[0.2em] mb-4">Advertiser Hub</p>
                            <ThemedNavLink href={route('campaigns.index')} active={route().current('campaigns.index')} icon="🚀">Campaigns</ThemedNavLink>
                            <ThemedNavLink href={route('wallet.index')} active={route().current('wallet.index')} icon="💳">Wallet</ThemedNavLink>
                        </div>
                    )}

                    <div className="pt-10 border-t border-pink-50 mt-10">
                        <ThemedNavLink href={route('profile.edit')} active={route().current('profile.edit')} icon="👤">My Profile</ThemedNavLink>
                        <Dropdown.Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                            <span>🚪</span> Logout
                        </Dropdown.Link>

                    </div>
                </nav>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* --- MOBILE HEADER --- */}
                <header className="flex items-center justify-between h-20 bg-white/80 backdrop-blur-xl border-b border-pink-100 px-6 sm:px-10 shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-pink-600 sm:hidden bg-pink-50 rounded-xl"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>

                    <h2 className="text-lg font-black text-gray-900 tracking-tight sm:text-2xl uppercase italic">
                        {header || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-4">
                         {/* Simple Wallet Balance Quick-View (Optional) */}
                         <div className="hidden md:flex bg-green-50 px-4 py-2 rounded-2xl border border-green-100 items-center gap-2">
                            <span className="text-green-600 font-black text-xs"></span>
                         </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="w-10 h-10 rounded-full bg-pink-600 text-white font-black flex items-center justify-center border-2 border-pink-100 shadow-lg shadow-pink-100">
                                    {user.email.charAt(0)}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Settings</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Sign Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* --- MAIN PAGE CONTENT --- */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-10 pb-32 sm:pb-10 bg-[#FAFAFC]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* --- MOBILE BOTTOM NAV (Visible only on small screens) --- */}
                <nav className="sm:hidden fixed bottom-6 left-6 right-6 bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-[2.5rem] h-16 px-8 flex items-center justify-between shadow-2xl z-[40]">
                    <Link href={route('dashboard')} className={`p-2 transition-all ${route().current('dashboard') ? 'text-pink-400 scale-125' : 'text-gray-400'}`}>
                        🏠
                    </Link>
                    <Link href={isPromoter ? route('promoter.gigs.index') : route('campaigns.index')} className={`p-2 transition-all ${route().current('*.index') ? 'text-pink-400 scale-125' : 'text-gray-400'}`}>
                        {isPromoter ? '⚡' : '🚀'}
                    </Link>
                    <Link href={route('wallet.index')} className={`p-2 transition-all ${route().current('wallet.index') ? 'text-pink-400 scale-125' : 'text-gray-400'}`}>
                        💰
                    </Link>
                    <Link href={route('profile.edit')} className={`p-2 transition-all ${route().current('profile.edit') ? 'text-pink-400 scale-125' : 'text-gray-400'}`}>
                        👤
                    </Link>
                </nav>
            </div>
        </div>
    );
}
