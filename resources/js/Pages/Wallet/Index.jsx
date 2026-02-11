import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function WalletIndex() {
    const { wallet, transactions, auth } = usePage().props;
    const isAdvertiser = auth.user.role === 'campaigner';

    const formatAmount = (amt) =>
        `₦${Number(amt).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

    return (
        <AuthenticatedLayout header="My Wallet">
            <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-3 sm:px-6">
                <div className="max-w-3xl mx-auto">

                    {/* --- WALLET HEADER CARD --- */}
                    <div className="relative overflow-hidden bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-8 mb-6 md:mb-8">
                        {/* Decorative Background Shape - Hidden on very small screens to save space */}
                        <div className={`hidden sm:block absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${isAdvertiser ? 'bg-purple-600' : 'bg-green-600'}`}></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="text-center md:text-left">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                                    Available Balance
                                </h2>
                                <p className={`text-4xl md:text-5xl font-black tracking-tighter ${isAdvertiser ? 'text-purple-600' : 'text-green-600'}`}>
                                    {formatAmount(wallet ?? 0)}
                                </p>
                            </div>

                            {/* --- ACTION BUTTONS --- */}
                            <div className="w-full md:w-auto">
                                {isAdvertiser ? (
                                    <Link
                                        href={route('wallet-fund')}
                                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-6 md:px-8 rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-95 uppercase text-[10px] md:text-xs tracking-widest w-full"
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Fund Wallet
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('withdraw.create')}
                                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-6 md:px-8 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-95 uppercase text-[10px] md:text-xs tracking-widest w-full"
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Withdraw Funds
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- TRANSACTION HISTORY --- */}
                    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-[10px] md:text-sm font-black text-gray-800 uppercase tracking-widest">
                                History
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-full uppercase">
                                {transactions.data.length} records
                            </span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {transactions.data.length === 0 ? (
                                <div className="p-10 text-center">
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No transactions yet.</p>
                                </div>
                            ) : (
                                transactions.data.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex flex-row items-center justify-between p-4 md:p-6 hover:bg-gray-50/80 transition-colors gap-3"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            {/* Icon - Smaller on Mobile */}
                                            <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
                                                t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {t.type === 'credit'
                                                        ? <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeWidth="2.5" />
                                                        : <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeWidth="2.5" />
                                                    }
                                                </svg>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-black text-gray-800 text-xs md:text-sm leading-tight truncate">{t.description}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[80px] md:max-w-none">
                                                        #{t.reference.slice(-6)}
                                                    </p>
                                                    <span className="text-[9px] text-gray-300">•</span>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                                                        {new Date(t.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end shrink-0">
                                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border mb-1 ${
                                                t.status === 'successful'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : t.status === 'pending'
                                                        ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                        : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                                {t.status}
                                            </div>
                                            <div className={`text-sm md:text-lg font-black tracking-tighter ${
                                                t.type === 'credit' ? 'text-green-600' : 'text-red-900'
                                            }`}>
                                                {t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount / 100)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Section - Scrollable on mobile */}
                        {transactions.links.length > 3 && (
                            <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-center overflow-x-auto gap-2">
                                {transactions.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`shrink-0 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                            link.active
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
                                        } ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
