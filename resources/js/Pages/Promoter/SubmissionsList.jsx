import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// --- NEW COMPONENT: COUNTDOWN TIMER ---
const CountdownTimer = ({ createdAt }) => {
    const calculateTimeLeft = () => {
        const submissionDate = new Date(createdAt);
        const targetDate = new Date(submissionDate.getTime() + 48 * 60 * 60 * 1000);
        const difference = targetDate - new Date();

        if (difference <= 0) return null;

        return {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [createdAt]);

    if (!timeLeft) {
        return (
            <div className="flex items-center gap-1.5 text-green-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tight">Post Verified</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Live For:</span>
            <div className="flex gap-1">
                {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((unit, i) => (
                    <div key={i} className="bg-gray-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">
                        {unit.toString().padStart(2, '0')}
                        {i < 2 && <span className="ml-1 text-gray-500 opacity-30">:</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- HELPERS ---
const getStatusStyle = (status) => {
    const styles = {
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        approved: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        disputed: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getPlatformBadge = (platform) => {
    const platforms = {
        twitter: 'bg-blue-600',
        whatsapp: 'bg-green-500',
        facebook: 'bg-indigo-600',
        instagram: 'bg-pink-600',
        tiktok: 'bg-black',
        youtube: 'bg-red-600',
    };
    return platforms[platform?.toLowerCase()] || 'bg-gray-600';
};

export default function SubmissionsIndex({ auth, submissions }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Submissions" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Earning History</h1>
                            <p className="text-gray-500 font-medium mt-2">Track your proof of work and payment status.</p>
                        </div>
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 px-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Submissions</p>
                            <p className="text-2xl font-black text-gray-900">{submissions.length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Post Retention</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {submissions.length > 0 ? (
                                        submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-1.5 h-10 rounded-full ${getPlatformBadge(sub.platform)}`} />
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm leading-tight uppercase">
                                                                {sub.gig?.title || 'General Campaign'}
                                                            </p>
                                                            <a href={sub.link} target="_blank" className="text-[10px] font-bold text-pink-600 hover:underline flex items-center gap-1 mt-1">
                                                                View Link 
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* COUNTDOWN COLUMN */}
                                                <td className="px-6 py-5">
                                                    <CountdownTimer createdAt={sub.created_at} />
                                                </td>

                                                <td className="px-6 py-5 text-center">
                                                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase border ${getStatusStyle(sub.status)}`}>
                                                        {sub.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <p className="text-xs font-black text-gray-900">
                                                        {new Date(sub.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400">
                                                        {new Date(sub.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-32 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                        <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    </div>
                                                    <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No shared posts yet</p>
                                                    <Link href={route('promoter.gigs.index')} className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-colors">
                                                        Find a Gig
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