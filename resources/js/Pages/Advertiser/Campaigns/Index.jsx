import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'active':
        case 'live': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'paused': return 'bg-gray-100 text-gray-500 border-gray-200';
        default: return 'bg-pink-100 text-pink-800 border-pink-200';
    }
};

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

export default function CampaignIndex() {
    const { campaigns, auth, flash } = usePage().props;

    const [showToast, setShowToast] = useState(false);
    const [modal, setModal] = useState({ show: false, type: '', id: null, title: '' });

    useEffect(() => {
        if (flash?.success) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const openModal = (id, type, title) => {
        setModal({ show: true, id, type, title });
    };

    const closeModal = () => setModal({ show: false, id: null, type: '', title: '' });

    const handleConfirm = () => {
        if (modal.type === 'delete') {
            router.delete(route('campaigns.destroy', modal.id));
        } else {
            const newStatus = modal.type === 'resume' ? 'live' : 'paused';
            router.patch(route('campaigns.update-status', modal.id), { status: newStatus });
        }
        closeModal();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            {/* TOAST NOTIFICATION */}
            {showToast && flash.success && (
                <div className="fixed top-24 right-4 z-[200] animate-in slide-in-from-right duration-300 px-4 w-full max-w-sm">
                    <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
                        <div className="shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                        <p className="text-xs font-bold flex-1">{flash.success}</p>
                        <button onClick={() => setShowToast(false)} className="text-gray-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-[#fcfcfc] min-h-screen py-6 md:py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">Your <span className="text-pink-600">Campaigns</span></h1>
                            <p className="text-gray-500 mt-2 font-medium italic text-[11px]">Unused balances are refunded to your wallet upon deletion.</p>
                        </div>
                        <Link href={route('campaigns.create')} className="w-full md:w-auto text-center bg-gray-900 hover:bg-pink-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest">
                            Create Campaign
                        </Link>
                    </div>

                    {/* MOBILE CARDS (Visible only on small screens) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {campaigns.map((c) => {
                            const status = c.status?.toLowerCase();
                            const isPaused = status === 'paused';
                            const isPending = status === 'pending';
                            const progress = Math.min(100, ((c.submissions_count || 0) / c.target_shares) * 100);

                            return (
                                <div key={c.id} className={`bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm ${isPaused ? 'opacity-70' : ''}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase leading-tight">{c.title}</h3>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-pink-600 bg-pink-50 px-2 py-1 rounded-lg">
                                            {formatCurrency(c.payout)}/share
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Progress</span>
                                            <span className="text-[9px] font-black text-gray-900 uppercase">{c.submissions_count} / {c.target_shares}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-700 ${isPaused ? 'bg-gray-300' : 'bg-pink-600'}`} style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {(isPending || isPaused) && (
                                            <Link href={route('campaigns.fund', c.id)} className="col-span-2 bg-green-600 text-white text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest mb-1">
                                                Fund Campaign
                                            </Link>
                                        )}
                                        <Link href={route('campaigns.submissions.index', c.id)} className="bg-gray-900 text-white text-center py-3 rounded-xl text-[10px] font-black uppercase">
                                            Review
                                        </Link>
                                        <div className="flex gap-2">
                                            {!isPending && (
                                                <button onClick={() => openModal(c.id, isPaused ? 'resume' : 'pause', c.title)} className="flex-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl py-3 flex justify-center">
                                                    {isPaused ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg>}
                                                </button>
                                            )}
                                            <button onClick={() => openModal(c.id, 'delete', c.title)} className="flex-1 bg-red-50 text-red-500 border border-red-100 rounded-xl py-3 flex justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* DESKTOP TABLE (Hidden on mobile) */}
                    <div className="hidden md:block bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign Info</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {campaigns.map((c) => {
                                    const status = c.status?.toLowerCase();
                                    const isPaused = status === 'paused';
                                    const isPending = status === 'pending';

                                    return (
                                        <tr key={c.id} className={isPaused ? 'bg-gray-50/40' : 'hover:bg-gray-50/20 transition-colors'}>
                                            <td className="px-6 py-6">
                                                <p className={`text-sm font-black uppercase ${isPaused ? 'text-gray-400' : 'text-gray-900'}`}>{c.title}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-500 ${isPaused ? 'bg-gray-300' : 'bg-pink-600'}`}
                                                         style={{ width: `${Math.min(100, ((c.submissions_count || 0) / c.target_shares) * 100)}%` }} />
                                                </div>
                                                <p className="text-[9px] font-black mt-2 text-gray-400 uppercase">{c.submissions_count} / {c.target_shares} Shares</p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex justify-center items-center gap-2">
                                                    {(isPending || isPaused) && (
                                                        <Link href={route('campaigns.fund', c.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-700 shadow-sm transition-all">
                                                            Fund
                                                        </Link>
                                                    )}
                                                    <Link href={route('campaigns.submissions.index', c.id)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-pink-600 transition-all">
                                                        Review
                                                    </Link>
                                                    {!isPending && (
                                                        <button onClick={() => openModal(c.id, isPaused ? 'resume' : 'pause', c.title)} className={`p-2 rounded-xl border transition-all ${isPaused ? 'bg-white text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                            {isPaused ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg>}
                                                        </button>
                                                    )}
                                                    <button onClick={() => openModal(c.id, 'delete', c.title)} className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {modal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`p-6 text-center text-white ${modal.type === 'delete' ? 'bg-red-600' : 'bg-gray-900'}`}>
                            <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                                {modal.type === 'delete' ? 'Delete Campaign?' : 'Confirm Action'}
                            </h3>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-gray-900 font-black uppercase text-[10px] tracking-widest mb-2">{modal.title}</p>
                            <p className="text-gray-500 text-[11px] font-bold leading-relaxed">
                                {modal.type === 'delete'
                                    ? "Ending this campaign will instantly refund the unused budget back to your wallet."
                                    : `Are you sure you want to ${modal.type} this campaign?`}
                            </p>
                            <div className="mt-8 flex flex-col gap-2">
                                <button onClick={handleConfirm} className={`w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest ${modal.type === 'delete' ? 'bg-red-600 shadow-red-100' : 'bg-gray-900 shadow-gray-100'} shadow-xl transition-all active:scale-95`}>
                                    Confirm & Proceed
                                </button>
                                <button onClick={closeModal} className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
