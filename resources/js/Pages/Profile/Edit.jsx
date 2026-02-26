import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateSocialHandlesForm from './Partials/UpdateSocialHandlesForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth, flash } = usePage().props;
    const [showAlert, setShowAlert] = useState(false);

    // Trigger alert when a flash message arrives from backend
    useEffect(() => {
        if (flash?.message || flash?.success || status) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash, status]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Settings" />

            {/* --- PREMIUM FLOATING ALERT --- */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
                <Transition
                    show={showAlert}
                    enter="transition ease-out duration-300"
                    enterFrom="opacity-0 -translate-y-4 scale-95"
                    enterTo="opacity-100 translate-y-0 scale-100"
                    leave="transition ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className="bg-gray-900 border border-white/10 shadow-2xl rounded-3xl p-4 pr-12 relative overflow-hidden group">
                        {/* Progress bar background */}
                        <div className="absolute bottom-0 left-0 h-1 bg-pink-600 animate-progress" />

                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-pink-600/10 rounded-2xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest leading-none mb-1">Success</p>
                                <p className="text-sm font-bold text-white tracking-tight">
                                    {flash?.message || flash?.success || status || "Changes saved successfully!"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAlert(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </Transition>
            </div>

            <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Settings</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 leading-none">Manage your identity and social presence</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Profile Info Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>

                        {/* SOCIAL HANDLES CARD */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <UpdateSocialHandlesForm />
                        </div>

                        {/* Password Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <UpdatePasswordForm />
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100">
                            <DeleteUserForm />
                        </div>
                    </div>
                </div>
            </div>

            {/* In-page animation for the progress bar */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 5000ms linear forwards;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
