import { Link } from '@inertiajs/react';

export default function GuestNavbar({ auth }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-[2rem] px-6 py-3 flex justify-between items-center transition-all duration-300">

                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-pink-600 transition-colors">
                            <span className="text-white font-black text-xs italic">G</span>
                        </div>
                        <span className="font-black text-lg tracking-tighter uppercase text-gray-900">
                            GIG<span className="text-pink-600">HUB</span>
                        </span>
                    </Link>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 px-4 py-2 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-100 transition-all active:scale-95"
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
