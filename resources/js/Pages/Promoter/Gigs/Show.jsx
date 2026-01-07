import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

export default function PromoterCampaignShow() {
    const { gig, hasSubmitted, auth } = usePage().props;

    // Derived brand data via relationship
    const brandName = gig.user?.campaigner?.brand_name || "Premium Brand";
    const brandLogo = gig.user?.campaigner?.logo_url;

    const shareText = `${gig.title}\n\n${gig.description}\n\nCheck it out!`;

    // Social links helper
    const getShareUrl = (platform) => {
        const text = encodeURIComponent(shareText);
        const url = gig.image_urls?.[0]?.url ? encodeURIComponent(gig.image_urls[0].url) : '';

        const links = {
            whatsapp: `https://wa.me/?text=${text}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}%20${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
        };
        return links[platform];
    };

    const handleDownload = (img) => {
        // Simple download trigger
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `campaign-asset-${img.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Gig: ${gig.title}`} />

            <div className="min-h-screen bg-gray-50 pb-24">
                {/* 1. COMPACT NAVIGATION & BRAND HEADER */}
                <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 py-3">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <Link href={route('promoter.gigs.index')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 overflow-hidden flex items-center justify-center text-white text-[10px] font-black uppercase">
                                {brandLogo ? <img src={brandLogo} className="w-full h-full object-cover" /> : brandName[0]}
                            </div>
                            <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{brandName}</span>
                        </div>
                        <div className="w-10"></div> {/* Spacer */}
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">

                    {/* 2. HERO PAYOUT CARD */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                            <span className="text-8xl font-black italic uppercase -rotate-12">{brandName}</span>
                        </div>

                        <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            Guaranteed Payout
                        </span>
                        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                            {formatCurrency(gig.payout)}
                        </h1>
                        <p className="text-gray-400 font-medium text-sm">For sharing this {gig.platform} campaign</p>
                    </div>

                    {/* 3. KEY CRITERIA TILES */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Required Followers</p>
                            <p className="text-xl font-black text-gray-900">{gig.min_followers?.toLocaleString() || '1'}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Slots</p>
                            <p className="text-xl font-black text-pink-600">{gig.available_slots || 'Unlimited'}</p>
                        </div>
                    </div>

                    {/* 4. ASSETS PREVIEW & DOWNLOAD */}
                    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-black text-gray-900 uppercase text-xs tracking-widest">Content to Share</h2>
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                {gig.image_urls?.length || 0} Assets
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {gig.image_urls?.map((img) => (
                                <div key={img.id} className="relative group rounded-3xl overflow-hidden aspect-square bg-gray-50 border border-gray-100">
                                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <button
                                        onClick={() => handleDownload(img)}
                                        className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-2xl shadow-xl hover:bg-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest mb-4">Post Description</h3>
                            <div className="bg-gray-50 p-5 rounded-2xl relative group">
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{gig.description}</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(shareText)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-pink-600 hover:text-pink-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    Copy Ad Text
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 5. SHARE CHANNELS */}
                    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                        <h2 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6">1-Click Share</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <a href={getShareUrl('whatsapp')} target="_blank" className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
                                <span className="text-2xl">💬</span>
                                <span className="text-[10px] font-black uppercase text-green-700">WhatsApp</span>
                            </a>
                            <a href={getShareUrl('twitter')} target="_blank" className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                                <span className="text-2xl">🐦</span>
                                <span className="text-[10px] font-black uppercase text-blue-700">Twitter</span>
                            </a>
                            <a href={getShareUrl('facebook')} target="_blank" className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                <span className="text-2xl">👥</span>
                                <span className="text-[10px] font-black uppercase text-indigo-700">Facebook</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 6. FLOATING ACTION BAR */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
                    <div className="max-w-3xl mx-auto">
                        {!hasSubmitted ? (
                            <Link
                                href={route('promoter.gigs.submit', gig.id)}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95"
                            >
                                Submit Proof of Share
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </Link>
                        ) : (
                            <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-center border border-gray-200">
                                Proof Already Submitted
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                body { overflow-x: hidden; }
            `}} />
        </AuthenticatedLayout>
    );
}
