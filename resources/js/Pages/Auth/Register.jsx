import { useForm, Link, Head } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        accepted_terms: false, // Added tracking for the checkbox
    });

    const submit = (e) => {
        e.preventDefault();

        // Basic frontend guard for the checkbox
        if (!data.accepted_terms) {
            alert('Please accept the Terms and Conditions to continue.');
            return;
        }

        post(route('register-user'), {
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation errors received:', errors);
            },
            onSuccess: () => {
                console.log('Registration successful');
            },
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="flex min-h-screen bg-white">
                {/* --- LEFT SIDE: IMAGE (Hidden on mobile) --- */}
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
                            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                            <p className="text-gray-500 mt-2">Get started with your free account today.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-gray-50"
                                    placeholder="name@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-gray-50"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-500 font-medium">{errors.password}</p>
                                    )}
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-gray-50"
                                        placeholder="••••••••"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* TERMS AND PRIVACY CHECKBOX */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        required
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-colors"
                                        checked={data.accepted_terms}
                                        onChange={(e) => setData('accepted_terms', e.target.checked)}
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                                        I agree to the
                                        <Link
                                            href={route('terms')}
                                            target="_blank"
                                            className="text-purple-600 font-bold hover:underline mx-1"
                                        >
                                            Terms and Conditions
                                        </Link>
                                        and acknowledge the Campaign Content Disclaimer.
                                    </label>
                                </div>
                                {errors.accepted_terms && (
                                    <p className="text-xs text-red-500 font-medium">{errors.accepted_terms}</p>
                                )}
                            </div>

                            {/* DYNAMIC PROFILE HINT */}
                            {Object.keys(errors).length > 0 && !errors.email && !errors.password && !errors.accepted_terms && (
                                <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200">
                                    <strong>Note:</strong> Additional profile details may be required in the next step.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-200 active:scale-[0.99]"
                            >
                                {processing ? 'Creating your account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-600">
                                Already have an account?
                                <Link href={route('login')} className="text-purple-600 font-bold ml-1 hover:text-purple-700">
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
