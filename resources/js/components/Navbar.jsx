import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestNavbar({ auth }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/90 backdrop-blur-xl border border-brand-100 shadow-lg shadow-brand-100/40 rounded-[2rem] px-6 py-3 flex justify-between items-center transition-all duration-300">

                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="h-12 w-auto" />
                    </Link>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-600 px-4 py-2 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-600 px-4 py-2 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-100 transition-all active:scale-95"
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
