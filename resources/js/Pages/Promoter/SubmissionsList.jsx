import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// Helper for status styling
const getStatusStyle = (status) => {
    const styles = {
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        approved: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        disputed: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
};

// Helper for platform icons/colors
const getPlatformBadge = (platform) => {
    const platforms = {
        twitter: 'bg-blue-600',
        instagram: 'bg-pink-600',
        facebook: 'bg-indigo-600',
        tiktok: 'bg-black',
        youtube: 'bg-red-600',
    };
    return platforms[platform?.toLowerCase()] || 'bg-gray-600';
};

export default function SubmissionsIndex({ auth, submissions }) {
    return (
        <AuthenticatedLayout user={auth.user} header="My Submissions">
            <Head title="My Submissions" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Earning History</h1>
                            <p className="text-gray-500 font-medium">Track your proof of work and payment status.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Total Submissions</p>
                                <p className="text-xl font-bold text-gray-900">{submissions.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign / Platform</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Link</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {submissions.length > 0 ? (
                                        submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-8 rounded-full ${getPlatformBadge(sub.platform)}`} />
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">
                                                                {sub.campaign?.title || 'Unknown Campaign'}
                                                            </p>
                                                            <span className="text-[10px] font-black uppercase text-gray-400">
                                                                {sub.platform}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <a 
                                                        href={sub.link} 
                                                        target="_blank" 
                                                        className="text-pink-600 hover:text-pink-700 text-sm font-bold flex items-center gap-1 group-hover:underline"
                                                    >
                                                        View Post
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    </a>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(sub.status)}`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {new Date(sub.created_at).toLocaleDateString('en-NG', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    </div>
                                                    <p className="text-gray-500 font-bold">No submissions yet.</p>
                                                    <Link href={route('promoter.gigs.index')} className="mt-2 text-pink-600 font-black uppercase text-xs hover:underline">
                                                        Browse available gigs
                                                    </Link>
                                                </div>
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