import { useForm, Link, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        referral_code: '',
        accepted_terms: false,
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref') || params.get('referral');
        if (ref) setData('referral_code', ref);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (!data.accepted_terms) {
            alert('Please accept the Terms and Conditions to continue.');
            return;
        }
        post(route('register-user'), { preserveScroll: true });
    };

    const pwStrength = () => {
        const p = data.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };
    const strength = pwStrength();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-brand-400', 'bg-brand-600'][strength];

    return (
        <>
            <Head title="Create Account" />

            <div className="min-h-screen flex bg-white">

                {/* ─── LEFT BRAND PANEL ─── */}
                <div className="hidden lg:flex lg:w-[45%] bg-brand-600 flex-col justify-between p-14 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-800/40 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                    {/* Logo */}
                    <div className="relative z-10">
                        <ApplicationLogo className="h-14 w-auto" inverse />
                    </div>

                    {/* Headline */}
                    <div className="relative z-10">
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
                            Your audience is<br />worth money.
                        </h2>
                        <p className="text-brand-100 text-lg font-medium leading-relaxed mb-12 max-w-sm">
                            Sign up free, browse active campaigns, and start earning from every share — no experience needed.
                        </p>

                        {/* Steps */}
                        <div className="space-y-5">
                            {[
                                { n: '1', text: 'Create your free account' },
                                { n: '2', text: 'Pick a campaign you like' },
                                { n: '3', text: 'Share & get paid instantly' },
                            ].map(step => (
                                <div key={step.n} className="flex items-center gap-4">
                                    <div className="w-9 h-9 bg-white text-brand-600 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                                        {step.n}
                                    </div>
                                    <span className="text-white font-bold">{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="relative z-10 grid grid-cols-3 gap-3">
                        {[
                            { value: '10K+', label: 'Promoters' },
                            { value: '₦50M', label: 'Paid Out' },
                            { value: '500+', label: 'Campaigns' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/15 rounded-2xl p-4 text-center border border-white/20">
                                <div className="text-xl font-black text-white">{stat.value}</div>
                                <div className="text-brand-200 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── RIGHT FORM PANEL ─── */}
                <div className="w-full lg:w-[55%] flex items-start justify-center p-6 sm:p-12 overflow-y-auto bg-white">
                    <div className="w-full max-w-md py-8">

                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-10">
                            <ApplicationLogo className="h-14 w-auto" />
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create your account</h1>
                            <p className="text-gray-400 font-medium">Free forever. Start earning in minutes.</p>
                        </div>

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
                                    required
                                    autoFocus
                                />
                                {errors.email && <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-wider">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 pr-14 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all outline-none font-medium text-gray-800"
                                        placeholder="Min. 8 characters"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
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
                                {/* Password strength bar */}
                                {data.password.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1,2,3,4].map(n => (
                                                <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= strength ? strengthColor : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-black uppercase tracking-wider ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-yellow-600' : 'text-brand-600'}`}>
                                            {strengthLabel}
                                        </p>
                                    </div>
                                )}
                                {errors.password && <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-wider">{errors.password}</p>}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 pr-14 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all outline-none font-medium text-gray-800 ${
                                            data.password_confirmation && data.password !== data.password_confirmation
                                                ? 'border-red-300 bg-red-50/30'
                                                : data.password_confirmation && data.password === data.password_confirmation
                                                ? 'border-brand-400 bg-brand-50/20'
                                                : 'border-gray-200'
                                        }`}
                                        placeholder="Re-enter password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors">
                                        {showConfirm
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        }
                                    </button>
                                    {/* Match checkmark */}
                                    {data.password_confirmation && data.password === data.password_confirmation && (
                                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                                            <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Referral code */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Referral Code</label>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Optional</span>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M19 8v6M22 11h-6"/>
                                            <circle cx="9" cy="7" r="4"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-brand-50/40 border border-brand-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all outline-none font-black uppercase tracking-widest text-brand-700 placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-300 placeholder:normal-case text-sm"
                                        placeholder="Enter referral code"
                                        value={data.referral_code}
                                        onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                                    />
                                </div>
                                {errors.referral_code && <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-wider">{errors.referral_code}</p>}
                            </div>

                            {/* Terms */}
                            <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4">
                                <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                                        checked={data.accepted_terms}
                                        onChange={(e) => setData('accepted_terms', e.target.checked)}
                                        required
                                    />
                                    <span className="text-xs font-medium text-gray-500 leading-relaxed">
                                        I agree to the{' '}
                                        <Link href={route('terms')} target="_blank" className="text-brand-600 font-black hover:underline">
                                            Terms of Service
                                        </Link>{' '}
                                        and acknowledge the Content Disclaimer.
                                    </span>
                                </label>
                            </div>

                            <button type="submit" disabled={processing}
                                className="w-full py-5 bg-brand-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-200 transition-all active:scale-[0.98] disabled:opacity-50">
                                {processing ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : 'Create Free Account'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-400 font-medium">
                                Already have an account?{' '}
                                <Link href={route('login')} className="text-brand-600 font-black hover:text-brand-700 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
