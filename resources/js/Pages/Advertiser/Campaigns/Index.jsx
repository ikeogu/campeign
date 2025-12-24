import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-pink-100 text-pink-800 border-pink-200';
    }
};

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

export default function CampaignIndex() {
    const { campaigns, auth } = usePage().props;

    const isVideo = (url) => url?.match(/\.(mp4|mov|avi|wmv|webm)$|video/i);

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="bg-[#fcfcfc] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 pb-6 border-b border-gray-100">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                Your <span className="text-pink-600">Campaigns</span>
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium">Manage outreach and monitor activity.</p>
                        </div>
                        <Link href={route('campaigns.create')} className="inline-flex items-center bg-gray-900 hover:bg-pink-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl transition-all">
                            Create Campaign
                        </Link>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="p-20 bg-white rounded-3xl text-center border border-gray-100">
                             {/* ... Empty State Code ... */}
                        </div>
                    ) : (
                        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress & Shares</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Financials</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {campaigns.map((c) => {
                                            // CALCULATIONS
                                            const totalSubmissions = c.submissions_count || 0; // Ensure your controller sends this
                                            const sharesLeft = Math.max(0, c.target_shares - totalSubmissions);
                                            const progressPercentage = Math.min(100, (totalSubmissions / c.target_shares) * 100);

                                            return (
                                                <tr key={c.id} className="hover:bg-pink-50/30 transition-colors group">
                                                    {/* Campaign Info */}
                                                    <td className="px-6 py-8">
                                                        <div className="text-base font-black text-gray-900 group-hover:text-pink-600">{c.title}</div>
                                                        <div className="flex gap-1 mt-1.5">
                                                            {c.platforms?.map(p => (
                                                                <span key={p} className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md uppercase tracking-tighter">{p}</span>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* SHARES PROGRESS COLUMN */}
                                                    <td className="px-6 py-8 min-w-[200px]">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-black text-gray-900">{totalSubmissions} <span className="text-gray-400 font-medium">/ {c.target_shares}</span></span>
                                                            <span className="text-[10px] font-black text-pink-500 uppercase">{sharesLeft} Left</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-pink-600 rounded-full transition-all duration-1000"
                                                                style={{ width: `${progressPercentage}%` }}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Financials */}
                                                    <td className="px-6 py-8">
                                                        <div className="text-sm font-black text-gray-900">{formatCurrency(c.payout)}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Per Approved Post</div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-8">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(c.status)}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="px-6 py-8">
                                                        <div className="flex justify-center items-center gap-2">
                                                            {/* NEW VIEW SUBMISSIONS BUTTON */}
                                                            <Link
                                                                href={route('campaigns.submissions.index', c.id)}
                                                                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                View Submissions
                                                            </Link>

                                                            {!c.is_funded && (
                                                                <Link href={route('campaigns.fund', c.id)} className="bg-green-100 text-green-700 p-2 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                </Link>
                                                            )}

                                                            <Link href={route('campaigns.edit', c.id)} className="bg-gray-50 text-gray-400 p-2 rounded-xl hover:bg-pink-50 hover:text-pink-600 border border-transparent hover:border-pink-100">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
