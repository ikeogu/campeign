import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [showToast, setShowToast] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
           name: user.name,
           email: user.email,
        });

    // Watch for successful update to trigger toast
    useEffect(() => {
        if (recentlySuccessful) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true
        });
    };

   return (
    <section className={className}>
        {/* --- COMPONENT LEVEL TOAST --- */}
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs">
            <Transition
                show={showToast}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 -translate-y-4 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div className="bg-gray-900 border border-white/10 shadow-2xl rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">
                            Profile Updated
                        </p>
                    </div>
                    {/* Auto-hide progress bar */}
                    <div className="absolute bottom-0 left-0 h-[3px] bg-green-500 transition-all duration-[4000ms] ease-linear w-full"
                         style={{ width: showToast ? '0%' : '100%' }} />
                </div>
            </Transition>
        </div>

        <header className="mb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Basic Information</h2>
            <p className="mt-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Update your primary account details</p>
        </header>

        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">Full Name</label>
                    <input
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">Email Address</label>
                    <input
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-800">
                        Email unverified.
                        <Link href={route('verification.send')} method="post" as="button" className="ml-2 underline hover:text-amber-900 font-black uppercase text-[10px]">
                            Resend Link
                        </Link>
                    </p>
                </div>
            )}

            <div className="flex items-center gap-4 pt-4">
                <button
                    disabled={processing}
                    className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest shadow-xl shadow-gray-100"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    </section>
);
}
