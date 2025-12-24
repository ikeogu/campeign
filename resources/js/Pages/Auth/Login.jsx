import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <Head title="Log in" />

            {/* --- LEFT SIDE: IMAGE SECTION (Hidden on mobile) --- */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"
                    alt="Digital Influence"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Brand Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/20 to-transparent"></div>

                <div className="relative z-10 self-end p-16 text-white">
                    <h2 className="text-4xl font-black leading-tight mb-4">
                        Unlock Your Reach, <br />
                        <span className="text-green-400">Maximize Your Impact.</span>
                    </h2>
                    <p className="text-lg text-gray-200 font-medium max-w-md">
                        Join thousands of creators and brands building the future of digital influence.
                    </p>
                </div>

                {/* Logo Placeholder */}
                <div className="absolute top-12 left-12 z-10">
                    <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
                        Gigs<span className="text-green-400">&</span>Campaigns
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 bg-gray-50 lg:bg-white">
                <div className="max-w-md w-full">

                    <div className="mb-10 lg:text-left text-center">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-gray-500 font-medium">Please enter your details to access your dashboard.</p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 bg-green-50 rounded-2xl text-sm font-bold text-green-700 border border-green-100">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-700 shadow-sm"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="username"
                                required
                                autoFocus
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-700 shadow-sm"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded-lg border-gray-300 text-green-600 shadow-sm focus:ring-green-500 w-5 h-5"
                                />
                                <span className="ms-3 text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                                    Keep me logged in
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-green-600 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] hover:bg-green-700 shadow-2xl shadow-green-500/30 transition-all transform active:scale-[0.97] disabled:opacity-50"
                        >
                            {processing ? 'Signing in...' : 'Sign In to Account'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            New here?
                            <Link
                                href={route('register')}
                                className="text-green-600 font-black ml-2 hover:text-green-700"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
