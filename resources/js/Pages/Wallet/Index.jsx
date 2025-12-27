import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, Link } from '@inertiajs/react'; // Added Link
import { useState } from 'react'; // Added for funding modal toggle

export default function WalletIndex() {
    const { wallet, transactions, auth } = usePage().props;
    const [isFunding, setIsFunding] = useState(false);

    // Check if user is an advertiser
    const isAdvertiser = auth.user.role === 'campaigner';

    const formatAmount = (amt) =>
        `₦${Number(amt).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

    return (
        <AuthenticatedLayout header="My Wallet">
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* --- WALLET HEADER CARD --- */}
                    <div className="relative overflow-hidden bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 mb-8">
                        {/* Decorative Background Shape */}
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${isAdvertiser ? 'bg-purple-600' : 'bg-green-600'}`}></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                                    Available Balance
                                </h2>
                                <p className={`text-5xl font-black tracking-tighter ${isAdvertiser ? 'text-purple-600' : 'text-green-600'}`}>
                                    {formatAmount(wallet ?? 0)}
                                </p>
                            </div>

                            {/* --- CONDITIONAL FUND BUTTON FOR ADVERTISERS --- */}
                            {isAdvertiser && (
                                <Link
                                    href={route('wallet-fund')}
                                    className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-purple-200 transition-all transform active:scale-95 uppercase text-xs tracking-widest"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Fund Wallet
                                </Link>
                            )}

                            {/* --- CONDITIONAL WITHDRAW BUTTON FOR PROMOTERS --- */}
                            {!isAdvertiser && (
                                <Link
                                    href={route('withdraw.create')}
                                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-green-200 transition-all transform active:scale-95 uppercase text-xs tracking-widest"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Withdraw Funds
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* --- TRANSACTION HISTORY --- */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                Transaction History
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full uppercase">
                                {transactions.data.length} records
                            </span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {transactions.data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No transactions yet.</p>
                                </div>
                            ) : (
                                transactions.data.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between p-6 hover:bg-gray-50/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Transaction Icon based on type */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {t.type === 'credit'
                                                        ? <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeWidth="2.5" />
                                                        : <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeWidth="2.5" />
                                                    }
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm leading-tight">{t.description}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        REF: {t.reference}
                                                    </p>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {new Date(t.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            {/* --- STATUS AT THE TOP --- */}
                                            <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                t.status === 'successful'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : t.status === 'pending'
                                                        ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                        : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                                {t.status}
                                            </div>

                                            {/* --- AMOUNT BELOW --- */}
                                            <div className={`text-lg font-black tracking-tighter ${
                                                t.type === 'credit' ? 'text-green-600' : 'text-red-900'
                                            }`}>
                                                {t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount / 100)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Section */}
                        {transactions.links.length > 3 && (
                            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-center gap-2">
                                {transactions.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            link.active
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'bg-white text-gray-400 hover:bg-gray-100'
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
