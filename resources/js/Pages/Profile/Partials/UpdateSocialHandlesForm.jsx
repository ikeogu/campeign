import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';

export default function UpdateSocialHandlesForm() {
    const { auth, status } = usePage().props; // 'status' comes from your back()->with()
    const [showToast, setShowToast] = useState(false);

    const user = auth.user;
    const existingHandles = Array.isArray(user.promoter?.social_handles)
        ? user.promoter.social_handles
        : [];

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        social_handles: existingHandles.length > 0 ? existingHandles : [{ platform: '', handle: '' }],
    });



   const submit = (e) => {
        e.preventDefault();

        post(route('profile.socials.update'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Backend received and processed data!");
            },
            onError: (err) => {
                console.error("Backend validation failed:", err);
            },
        });
    };

    return (
        <section className="relative">
            {/* --- THE TOAST --- */}
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
                            <div className="flex-shrink-0 w-8 h-8 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                {status || "Socials Updated"}
                            </p>
                        </div>
                        <div className={`absolute bottom-0 left-0 h-[3px] bg-pink-500 transition-all duration-[4000ms] ease-linear ${showToast ? 'w-full' : 'w-0'}`} />
                    </div>
                </Transition>
            </div>

            <header className="mb-8">
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase text-center sm:text-left">Social Media Hub</h2>
                <p className="mt-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">Connect your handles for faster gig submissions</p>
            </header>

            <form onSubmit={submit} className="space-y-4">
                {data.social_handles.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex-1">
                            <input
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                placeholder="Platform (e.g. X, TikTok)"
                                value={item.platform}
                                onChange={(e) => {
                                    const newHandles = [...data.social_handles];
                                    newHandles[index].platform = e.target.value;
                                    setData('social_handles', newHandles);
                                }}
                            />
                        </div>
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
                        {data.social_handles.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setData('social_handles', data.social_handles.filter((_, i) => i !== index))}
                                className="p-4 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        )}
                    </div>
                ))}

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => setData('social_handles', [...data.social_handles, { platform: '', handle: '' }])}
                        className="w-full sm:w-auto px-6 py-4 border-2 border-dashed border-gray-200 text-gray-400 font-black rounded-2xl hover:border-pink-200 hover:text-pink-500 transition-all uppercase text-[10px] tracking-widest"
                    >
                        + Add Platform
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest shadow-xl shadow-gray-100"
                    >
                        {processing ? 'Saving...' : 'Save Social Hub'}
                    </button>
                </div>
            </form>
        </section>
    );
}
