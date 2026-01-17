import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function FundSuccess({ campaign }) {
    return (
        <AuthenticatedLayout>
            <Head title="Payment Successful" />

            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">

                    {/* Celebration Icon */}
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-green-100 scale-150 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full shadow-2xl shadow-green-200">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Success Content */}
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
                        Payment <span className="text-green-600">Confirmed!</span>
                    </h1>

                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                        Your budget has been successfully secured for <span className="text-gray-900 font-bold">{campaign?.title || 'your campaign'}</span>.
                        Our system is now synchronizing with the network.
                    </p>

                    {/* Status Info Box */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-10 shadow-sm">
                        <div className="flex items-center gap-4 text-left">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Activating Gig</h4>
                                <p className="text-xs text-gray-400 font-medium">It may take a few minutes for promoters to see your campaign.</p>
                            </div>
                        </div>
                    </div>

                    {/* Responsive Actions */}
                    <div className="flex flex-col gap-4">
                        <Link
                            href={route('campaigns.index')}
                            className="w-full bg-gray-900 hover:bg-pink-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm"
                        >
                            Go to Dashboard
                        </Link>

                        <Link
                            href={route('campaigns.index')}
                            className="w-full bg-white text-gray-400 hover:text-gray-600 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                        >
                            View Campaign Details
                        </Link>
                    </div>

                    <p className="mt-12 text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
                        Transaction Secured by Paystack &bull; 2026
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
