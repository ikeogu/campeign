import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Referrals({ referrals, totalEarnings }) {
    const { auth } = usePage().props;

    // Stats calculation (assuming referrals data contains earnings per user)
    const totalReferred = referrals.length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Referral Program" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Affiliate Hub</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Earn 10% commission from your network</p>
                        </div>

                        {/* Referral Link Box */}
                        <div className="bg-white border border-gray-100 p-2 rounded-2xl flex items-center gap-3 shadow-sm">
                            <code className="text-[10px] font-bold text-purple-600 px-3 uppercase">
                                {window.location.origin}/register?ref={auth.user.referral_id}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${auth.user.referral_id}`);
                                    alert('Link Copied!');
                                }}
                                className="bg-gray-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-purple-600 transition-all"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>

                    {/* Stats Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Size</p>
                            <h3 className="text-3xl font-black text-gray-900">{totalReferred} Users</h3>
                        </div>
                        <div className="bg-purple-600 p-8 rounded-[2.5rem] shadow-xl shadow-purple-100">
                            <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest mb-1">Total Commission</p>
                            <h3 className="text-3xl font-black text-white">${totalEarnings.toFixed(2)}</h3>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commission Rate</p>
                            <h3 className="text-3xl font-black text-gray-900">10.0%</h3>
                        </div>
                    </div>

                    {/* Referred Users Table */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Referred Network</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed Posts</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Your 10%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {referrals.map((referral) => (
                                        <tr key={referral.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-gray-900 text-sm">
                                                {referral.name}
                                            </td>
                                            <td className="px-8 py-6 text-gray-500 text-sm font-medium">
                                                {new Date(referral.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-gray-900 font-black text-sm">
                                                {referral.completed_posts_count || 0}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                    + ${((referral.total_spent || 0) * 0.10).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {referrals.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-bold uppercase text-xs">
                                                No referrals yet. Share your link to start earning.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
