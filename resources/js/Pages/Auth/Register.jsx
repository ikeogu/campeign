import { useForm, Link, Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Register() {
    // 1. Add referral_code to the form state
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        referral_code: '', // New Field
        accepted_terms: false,
    });

    // 2. Automatically grab referral code from URL if present (e.g., ?ref=CHRIS123)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref') || params.get('referral');
        if (ref) {
            setData('referral_code', ref);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();

        if (!data.accepted_terms) {
            alert('Please accept the Terms and Conditions to continue.');
            return;
        }

        post(route('register-user'), {
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation errors received:', errors);
            },
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="flex min-h-screen bg-white">
                {/* --- LEFT SIDE: IMAGE --- */}
                <div className="hidden lg:flex lg:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000"
                        alt="Join the community"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent flex flex-col justify-end p-12 text-white">
                        <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                            Connect. Promote. <br /> Grow your Influence.
                        </h1>
                        <p className="text-lg text-purple-100 max-w-md">
                            Join thousands of creators and brands building the future of digital marketing together.
                        </p>
                    </div>
                </div>

                {/* --- RIGHT SIDE: FORM --- */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50">
                    <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 leading-none">Create Account</h2>
                            <p className="text-gray-500 mt-3 text-sm font-medium">Get started with your free account today.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* EMAIL */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-gray-50 font-medium"
                                    placeholder="name@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-tight">{errors.email}</p>}
                            </div>

                            {/* PASSWORDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-[10px]">Password</label>
                                    <input
                                        type="password"
                                        className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-gray-50"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-[10px]">Confirm</label>
                                    <input
                                        type="password"
                                        className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-gray-50"
                                        placeholder="••••••••"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.password && <div className="sm:col-span-2 text-[10px] text-red-500 font-bold uppercase">{errors.password}</div>}
                            </div>

                            {/* REFERRAL CODE (NEW) */}
                            <div className="pt-2">
                                <label className="flex justify-between items-center mb-2 ml-1">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Referral Code</span>
                                    <span className="text-[10px] font-bold text-gray-300 italic uppercase">Optional</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-purple-50/30 font-black uppercase tracking-widest placeholder:font-normal placeholder:tracking-normal text-purple-700"
                                        placeholder="EX: PROMO2024"
                                        value={data.referral_code}
                                        onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                                    />
                                </div>
                                {errors.referral_code && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{errors.referral_code}</p>}
                            </div>

                            {/* TERMS CHECKBOX */}
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        required
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-colors cursor-pointer"
                                        checked={data.accepted_terms}
                                        onChange={(e) => setData('accepted_terms', e.target.checked)}
                                    />
                                    <label htmlFor="terms" className="text-[11px] font-medium text-gray-500 leading-tight cursor-pointer">
                                        I agree to the
                                        <Link href={route('terms')} target="_blank" className="text-purple-600 font-black hover:underline mx-1">Terms</Link>
                                        & acknowledge the Content Disclaimer.
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-xl shadow-purple-100 active:scale-[0.98] text-xs"
                            >
                                {processing ? 'Initializing...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                            <p className="text-gray-500 text-sm font-medium">
                                Already a member?
                                <Link href={route('login')} className="text-purple-600 font-black ml-2 hover:text-purple-700 transition-colors">
                                    LOG IN
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
