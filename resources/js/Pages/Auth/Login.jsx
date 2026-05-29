import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <Head title="Sign In" />

            {/* ─── LEFT BRAND PANEL ─── */}
            <div className="hidden lg:flex lg:w-[45%] bg-brand-600 flex-col justify-between p-14 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-800/40 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10">
                    <ApplicationLogo className="h-14 w-auto" inverse />
                </div>

                {/* Headline */}
                <div className="relative z-10">
                    <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
                        Earn from every<br />share you make.
                    </h2>
                    <p className="text-brand-100 text-lg font-medium leading-relaxed mb-12 max-w-sm">
                        Connect with top brands, promote their content, and get paid instantly to your wallet.
                    </p>

                    {/* Feature pills */}
                    <div className="space-y-4">
                        {[
                            { icon: '⚡', text: 'Instant wallet credits per share' },
                            { icon: '🔒', text: 'AI-verified payouts, no fraud' },
                            { icon: '💸', text: 'Withdraw anytime, no minimums' },
                        ].map(item => (
                            <div key={item.text} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-lg shrink-0">
                                    {item.icon}
                                </div>
                                <span className="text-white font-bold text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social proof */}
                <div className="relative z-10 bg-white/15 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex -space-x-2">
                            {['E','A','M','J','T'].map((l, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/30 border-2 border-brand-500 flex items-center justify-center text-white font-black text-xs">
                                    {l}
                                </div>
                            ))}
                        </div>
                        <span className="text-white/80 text-sm font-bold">+9,995 more promoters</span>
                    </div>
                    <p className="text-brand-100 text-sm font-medium italic">
                        "I made my first ₦15,000 in one week just by sharing brands I already love."
                    </p>
                </div>
            </div>

            {/* ─── RIGHT FORM PANEL ─── */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <ApplicationLogo className="h-14 w-auto" />
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome back</h1>
                        <p className="text-gray-400 font-medium">Sign in to your Gigs & Campaigns account.</p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 bg-brand-50 rounded-2xl text-sm font-bold text-brand-700 border border-brand-100">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all outline-none font-medium text-gray-800 placeholder:text-gray-300"
                                placeholder="you@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="username"
                                autoFocus
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')}
                                        className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors">
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 pr-14 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all outline-none font-medium text-gray-800"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors">
                                    {showPass
                                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    }
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Remember me */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-5 h-5 rounded-lg"
                            />
                            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                                Keep me signed in
                            </span>
                        </label>

                        <button type="submit" disabled={processing}
                            className="w-full py-5 bg-brand-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
                            {processing ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 font-medium">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="text-brand-600 font-black hover:text-brand-700 transition-colors">
                                Create one free
                            </Link>
                        </p>
                    </div>

                    <p className="mt-8 text-center text-[10px] text-gray-300 font-medium">
                        By signing in you agree to our{' '}
                        <Link href={route('terms')} className="underline hover:text-brand-500">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
