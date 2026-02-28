import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';

export default function UpdateSocialHandlesForm() {
    const { auth, status } = usePage().props;
    const [showToast, setShowToast] = useState(false);

    // Defined list of platforms
    const PLATFORMS = [
        'Instagram',
        'TikTok',
        'X (Twitter)',
        'YouTube',
        'Facebook',
        'Threads',
        'Snapchat'
    ];

    const user = auth.user;
    const existingHandles = Array.isArray(user.promoter?.social_handles)
        ? user.promoter.social_handles
        : [];

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        social_handles: existingHandles.length > 0 ? existingHandles : [{ platform: PLATFORMS[0], handle: '' }],
    });

    useEffect(() => {
        if (recentlySuccessful || status) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful, status]);

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.socials.update'), {
            preserveScroll: true,
        });
    };

    return (
        <section className="relative">
            {/* --- THE TOAST --- */}
            <header className="mb-8">
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Social Media Hub</h2>
                <p className="mt-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select your platforms and add your handles</p>
            </header>

            <form onSubmit={submit} className="space-y-4">
                {data.social_handles.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-left-2 duration-300">

                        {/* PLATFORM SELECT DROPDOWN */}
                        <div className="flex-1">
                            <select
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all appearance-none cursor-pointer"
                                value={item.platform}
                                onChange={(e) => {
                                    const value = e.target.value.toLowerCase();

                                    setData('social_handles',
                                        data.social_handles.map((item, i) =>
                                            i === index
                                                ? { ...item, platform: value }
                                                : item
                                        )
                                    );
                                }}
                            >
                                {PLATFORMS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        {/* USERNAME INPUT */}
                        <div className="flex-[2] relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">@</span>
                            <input
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl pl-10 pr-5 py-4 font-bold text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                placeholder="username"
                                value={item.handle}
                                onChange={(e) => {
                                    const val = e.target.value.replace('@', '');
                                    const updated = data.social_handles.map((item, i) =>
                                        i === index ? { ...item, handle: val } : item
                                    );
                                    setData('social_handles', updated);
                                }}
                            />
                        </div>

                        {/* REMOVE BUTTON */}
                        {data.social_handles.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setData('social_handles', data.social_handles.filter((_, i) => i !== index))}
                                className="p-4 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        )}
                    </div>
                ))}

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => setData('social_handles', [...data.social_handles, { platform: PLATFORMS[0], handle: '' }])}
                        className="w-full sm:w-auto px-6 py-4 border-2 border-dashed border-gray-200 text-gray-400 font-black rounded-2xl hover:border-pink-200 hover:text-pink-500 transition-all uppercase text-[10px] tracking-widest"
                    >
                        + Add Another
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest shadow-xl shadow-gray-100"
                    >
                        {processing ? 'Saving...' : 'Save Hub'}
                    </button>
                </div>
            </form>
        </section>
    );
}
