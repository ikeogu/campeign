import { Head, Link } from '@inertiajs/react';

export default function AccountDeactivated({ reason, deactivatedAt }) {
    return (
        <>
            <Head title="Account Deactivated" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Account Deactivated</h1>
                    </div>

                    <div className="p-8 space-y-6">
                        <p className="text-sm font-medium text-gray-600 leading-relaxed text-center">
                            Your account has been deactivated by an administrator. You cannot submit proof, request withdrawals,
                            manage campaigns, or perform any other action while your account is in this state.
                        </p>

                        {reason && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Reason given</p>
                                <p className="text-sm font-bold text-red-700">{reason}</p>
                            </div>
                        )}

                        {deactivatedAt && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                Deactivated on {new Date(deactivatedAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        )}

                        <p className="text-xs font-medium text-gray-500 text-center">
                            If you believe this is a mistake, please contact support to have your account reviewed.
                        </p>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-600 transition-colors"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
