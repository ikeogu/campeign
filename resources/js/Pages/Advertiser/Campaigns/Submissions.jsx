import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function SubmissionsReview({ auth, campaign, submissions }) {
    const [filter, setFilter] = useState('all');

    const filteredSubmissions = submissions.filter(s =>
        filter === 'all' ? true : s.platform?.toLowerCase() === filter
    );

    const platformCounts = submissions.reduce((acc, sub) => {
        acc[sub.platform?.toLowerCase()] = (acc[sub.platform?.toLowerCase()] || 0) + 1;
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Gallery: ${campaign.title}`} />

            <div className="bg-[#f8f9fa] min-h-screen py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- HEADER --- */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="space-y-3">
                            <Link href={route('campaigns.index')} className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-pink-600 transition-colors flex items-center gap-1">
                                <span>←</span> Back to Overview
                            </Link>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                Live <span className="text-pink-600">Submissions</span>
                            </h1>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="bg-white border border-gray-200 px-3 py-1 rounded-full font-bold text-gray-600 shadow-sm">
                                    {submissions.length} Total Shares
                                </span>
                                <span className="text-gray-400 font-medium italic hidden sm:inline">
                                    Monitoring activity for "{campaign.title}"
                                </span>
                            </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-5 py-2 rounded-2xl text-xs font-black uppercase transition-all ${filter === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                            >
                                All Content
                            </button>
                            {Object.keys(platformCounts).map(plat => (
                                <button
                                    key={plat}
                                    onClick={() => setFilter(plat)}
                                    className={`px-5 py-2 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${filter === plat ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    {plat}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filter === plat ? 'bg-pink-400' : 'bg-gray-100 text-gray-400'}`}>
                                        {platformCounts[plat]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- FIXED GRID (REPLACED MASONRY) --- */}
                    {filteredSubmissions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                            {filteredSubmissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col h-full"
                                >
                                    {/* Image Container with Fixed Aspect Ratio */}
                                    <div className="aspect-[4/5] w-full bg-gray-50 relative overflow-hidden shrink-0">
                                        {sub.full_proof_url ? (
                                            <img
                                                src={sub.full_proof_url}
                                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                                alt="Proof"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[10px] uppercase font-black">
                                                No Preview Available
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-5 right-5">
                                            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${sub.status === 'approved' ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`} />
                                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{sub.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Panel - Fills remaining space */}
                                    <div className="p-6 flex flex-col flex-grow justify-between">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center font-black text-xs text-pink-600 border border-pink-100 shrink-0">
                                                {sub.user?.name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight leading-none mb-1">
                                                    {sub.user?.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {sub.platform}
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={sub.link}
                                            target="_blank"
                                            className="w-full text-center py-4 bg-gray-900 hover:bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-gray-200"
                                        >
                                            View Live Post ↗
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-[3rem] py-32 text-center border border-gray-100 shadow-sm">
                            <p className="text-gray-300 font-black uppercase tracking-widest italic">No submissions found</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
