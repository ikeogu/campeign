import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestNavbar({ auth }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-3 sm:px-4 py-3 sm:py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/90 backdrop-blur-xl border border-brand-100 shadow-lg shadow-brand-100/40 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center transition-all duration-300">

                    {/* Logo — compact on mobile */}
                    <Link href="/" className="flex items-center shrink-0">
                        <ApplicationLogo className="h-8 sm:h-10 w-auto" />
                    </Link>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-1 sm:gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-600 px-3 sm:px-4 py-2 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-600 px-4 py-2 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl hover:bg-brand-700 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
