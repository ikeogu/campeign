import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'active':
        case 'live': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-pink-100 text-pink-800 border-pink-200';
    }
};

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

export default function CampaignIndex() {
    const { campaigns, auth } = usePage().props;

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
                            <p className="text-gray-500 mt-1 font-medium">Manage outreach and monitor activity.</p>
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
                        <>
                            {/* MOBILE VIEW (CARDS) */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {campaigns.map((c) => {
                                    const totalSubmissions = c.submissions_count || 0;
                                    const progressPercentage = Math.min(100, (totalSubmissions / c.target_shares) * 100);
                                    const isLive = c.status?.toLowerCase() === 'live' || c.status?.toLowerCase() === 'active';

                                    return (
                                        <div key={c.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="bg-pink-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">
                                                    {c.category || 'General'}
                                                </span>
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 mb-1">{c.title}</h3>
                                            <div className="text-sm font-bold text-pink-600 mb-4">{formatCurrency(c.payout)} <span className="text-gray-400 text-xs font-medium">/ share</span></div>

                                            <div className="mb-4">
                                                <div className="flex justify-between text-[10px] font-black mb-1.5">
                                                    <span>{totalSubmissions} / {c.target_shares} SHARES</span>
                                                    <span className="text-pink-500">{Math.round(progressPercentage)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                                    <div className="h-full bg-pink-600 rounded-full" style={{ width: `${progressPercentage}%` }} />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                                                <Link href={route('campaigns.submissions.index', c.id)} className="flex-1 text-center bg-gray-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                    Submissions
                                                </Link>

                                                {/* CONDITIONAL FUND BUTTON */}
                                                {!isLive && (
                                                    <Link href={route('campaigns.fund', c.id)} className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                        Fund
                                                    </Link>
                                                )}

                                                <Link href={route('campaigns.edit', c.id)} className="bg-gray-100 text-gray-500 p-2.5 rounded-xl">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* DESKTOP VIEW (TABLE) */}
                            <div className="hidden md:block bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden border border-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign Details</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress & Shares</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Financials</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {campaigns.map((c) => {
                                                const totalSubmissions = c.submissions_count || 0;
                                                const sharesLeft = Math.max(0, c.target_shares - totalSubmissions);
                                                const progressPercentage = Math.min(100, (totalSubmissions / c.target_shares) * 100);
                                                const isLive = c.status?.toLowerCase() === 'live' || c.status?.toLowerCase() === 'active';

                                                return (
                                                    <tr key={c.id} className="hover:bg-pink-50/30 transition-colors group">
                                                        <td className="px-6 py-8">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <span className="bg-pink-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                                                    {c.category || 'General'}
                                                                </span>
                                                            </div>
                                                            <div className="text-base font-black text-gray-900 group-hover:text-pink-600 transition-colors">
                                                                {c.title}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-8 min-w-[200px]">
                                                            <div className="flex justify-between items-end mb-2">
                                                                <span className="text-sm font-black text-gray-900">{totalSubmissions} <span className="text-gray-400 font-medium">/ {c.target_shares}</span></span>
                                                                <span className="text-[10px] font-black text-pink-500 uppercase">{sharesLeft} Left</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-pink-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-8">
                                                            <div className="text-sm font-black text-gray-900">{formatCurrency(c.payout)}</div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Payout per share</div>
                                                        </td>

                                                        <td className="px-6 py-8">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(c.status)}`}>
                                                                {c.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-8 text-right">
                                                            <div className="flex justify-center items-center gap-2">
                                                                {/* CONDITIONAL FUND BUTTON */}
                                                                {!isLive && (
                                                                    <Link href={route('campaigns.fund', c.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                                                                        Fund
                                                                    </Link>
                                                                )}

                                                                <Link href={route('campaigns.submissions.index', c.id)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-pink-600 transition-all shadow-lg shadow-gray-200">
                                                                    View
                                                                </Link>
                                                                <Link href={route('campaigns.edit', c.id)} className="bg-gray-50 text-gray-400 p-2 rounded-xl hover:bg-pink-50 hover:text-pink-600 border border-transparent hover:border-pink-100 transition-all">
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
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
