import React, { useState } from 'react';
import { Link, Head } from "@inertiajs/react";
import Footer from "@/Components/Footer";

export default function Campaigns({ allGigs = [] }) {
    const [activeCategory, setActiveCategory] = useState('All');

    // Extract unique categories
    const categories = ['All', ...new Set(allGigs.map(gig => gig.category).filter(Boolean))];

    const filteredGigs = activeCategory === 'All'
        ? allGigs
        : allGigs.filter(gig => gig.category === activeCategory);

    const getPlatformStyle = (platform) => {
        const styles = {
            twitter: 'bg-blue-50 text-blue-600 border-blue-100',
            x: 'bg-blue-50 text-blue-600 border-blue-100',
            instagram: 'bg-pink-50 text-pink-600 border-pink-100',
            tiktok: 'bg-slate-900 text-white border-slate-700',
            whatsapp: 'bg-green-50 text-green-600 border-green-100',
            facebook: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
        return styles[platform?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-pink-100">
            <Head title="Browse Campaigns" />

            {/* Header with improved styling */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active <span className="text-pink-600">Gigs</span></h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Select a brand asset to share and start earning.</p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Compact Sidebar with dynamic category list */}
                    <aside className="w-full lg:w-56 flex-shrink-0">
                        <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="font-black text-gray-400 uppercase text-[9px] tracking-[0.2em] mb-4">Categories</h3>
                            <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap text-left ${
                                            activeCategory === cat
                                            ? 'bg-gray-900 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Optimized Grid */}
                    <div className="flex-grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredGigs.map((gig) => {
                                const brandName = gig.user?.campaigner?.company_name || "Exclusive Brand";
                                const brandLogo = gig.user?.campaigner?.logo_url;

                                return (
                                    <div
                                        key={gig.id}
                                        className={`group relative bg-white rounded-[2rem] border border-gray-100 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1
                                            ${gig.status === 'completed' ? 'opacity-60' : 'opacity-100'}`}
                                    >
                                        {/* Header: Brand Profile */}
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                                    {brandLogo ? (
                                                        <img src={brandLogo} alt={brandName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-black text-gray-400 text-xs">{brandName[0]}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-gray-900 text-[11px] uppercase tracking-tight truncate w-24">
                                                        {brandName}
                                                    </h4>
                                                    <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">
                                                        Paying ₦{Number(gig.payout).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex -space-x-1">
                                                {gig.platforms?.slice(0, 2).map((p, idx) => (
                                                    <div key={idx} className={`w-5 h-5 rounded-md border-2 border-white flex items-center justify-center text-[7px] font-black uppercase ${getPlatformStyle(p)}`}>
                                                        {p[0]}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Main Asset View with Overlay Category Badge */}
                                        <div className="px-3">
                                            <div className="relative h-44 rounded-[1.5rem] bg-gray-900 overflow-hidden flex items-center justify-center">
                                                {gig.image_urls && gig.image_urls.length > 0 ? (
                                                    <img
                                                        src={gig.image_urls[0].url}
                                                        alt={gig.title}
                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <span className="text-5xl opacity-20">📢</span>
                                                )}

                                                {/* Gradient Overlay for Text Readability */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                                {/* Category Label - Styled as a floating badge */}
                                                <span className="absolute bottom-3 left-4 bg-pink-600 text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded shadow-lg">
                                                    {gig.category || 'General'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="p-4">
                                            {/* Campaign Title Added for Public Context */}
                                            <h2 className="font-black text-gray-900 text-sm leading-tight line-clamp-1 mb-3">
                                                {gig.title}
                                            </h2>

                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-1 flex-grow bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-pink-500 rounded-full transition-all"
                                                        style={{ width: `${gig.completion_percentage || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase">{gig.completion_percentage || 0}% Used</span>
                                            </div>

                                            <Link
                                                href={route('login')}
                                                className="block w-full py-3.5 bg-gray-900 text-white rounded-xl text-center font-black text-[10px] uppercase tracking-[0.15em] hover:bg-pink-600 transition-colors shadow-lg shadow-gray-200"
                                            >
                                                Start Earning
                                            </Link>
                                        </div>

                                        {/* Completed Mask */}
                                        {gig.status === 'completed' && (
                                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-[2rem] flex items-center justify-center z-10">
                                                <span className="bg-gray-800 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Budget Reached</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
