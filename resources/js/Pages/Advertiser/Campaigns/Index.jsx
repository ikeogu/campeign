import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, router } from '@inertiajs/react';

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
    const { campaigns, auth } = usePage().props;

    const handleStatusToggle = (id, currentStatus) => {
        const newStatus = currentStatus === 'paused' ? 'live' : 'paused';
        if (confirm(`Are you sure you want to ${newStatus} this campaign?`)) {
            router.patch(route('campaigns.update-status', id), { status: newStatus });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Delete Campaign? Unused budget will be refunded to your wallet. Pending payouts will be reserved until approved/rejected.")) {
            router.delete(route('campaigns.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="bg-[#fcfcfc] min-h-screen py-6 md:py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4 pb-6 border-b border-gray-100">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                Your <span className="text-pink-600">Campaigns</span>
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium">Unused balances from deleted campaigns are refunded to your wallet.</p>
                        </div>
                        <Link href={route('campaigns.create')} className="w-full md:w-auto text-center inline-flex justify-center items-center bg-gray-900 hover:bg-pink-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl transition-all">
                            Create Campaign
                        </Link>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="p-10 md:p-20 bg-white rounded-3xl text-center border border-gray-100">
                             <p className="text-gray-400 font-bold">No campaigns found. Start by creating one!</p>
                        </div>
                    ) : (
                        <div className="hidden md:block bg-white shadow-sm rounded-[2rem] overflow-hidden border border-gray-100">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {campaigns.map((c) => {
                                        const isPaused = c.status?.toLowerCase() === 'paused';
                                        const isLive = c.status?.toLowerCase() === 'live' || c.status?.toLowerCase() === 'active';
                                        const progress = Math.min(100, ((c.submissions_count || 0) / c.target_shares) * 100);

                                        return (
                                            <tr key={c.id} className={`transition-opacity ${isPaused ? 'opacity-60' : 'opacity-100'}`}>
                                                <td className="px-6 py-6">
                                                    <p className="text-sm font-black text-gray-900 uppercase">{c.title}</p>
                                                    <p className="text-[10px] font-bold text-pink-600">{formatCurrency(c.payout)} per share</p>
                                                </td>
                                                <td className="px-6 py-6 w-64">
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                                        <div className={`h-full rounded-full ${isPaused ? 'bg-gray-400' : 'bg-pink-600'}`} style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <p className="text-[9px] font-black mt-2 text-gray-400 uppercase">{c.submissions_count} / {c.target_shares} SHARES</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(c.status)}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {/* SUBMISSIONS LINK */}
                                                        <Link href={route('campaigns.submissions.index', c.id)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-pink-600">
                                                            Review
                                                        </Link>

                                                        {/* PAUSE / RESUME TOGGLE */}
                                                        <button
                                                            onClick={() => handleStatusToggle(c.id, c.status)}
                                                            className={`p-2 rounded-xl border transition-colors ${isPaused ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}
                                                            title={isPaused ? "Resume" : "Pause"}
                                                        >
                                                            {isPaused ? (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                            )}
                                                        </button>

                                                        {/* DELETE / REFUND */}
                                                        <button
                                                            onClick={() => handleDelete(c.id)}
                                                            className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                            title="Delete & Refund"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
