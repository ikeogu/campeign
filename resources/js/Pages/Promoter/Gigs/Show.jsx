import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head, router } from '@inertiajs/react';
import { useState } from 'react';

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

export default function PromoterCampaignShow() {
    const { gig, hasSubmitted, auth } = usePage().props;
    const [showReminder, setShowReminder] = useState(false);

    const brandName = gig.user?.campaigner?.brand_name || "Premium Brand";
    const brandLogo = gig.user?.campaigner?.logo_url;
    const shareText = `${gig.title}\n\n${gig.description}\n\nCheck it out!`;

    const platforms = Array.isArray(gig.platforms)
  ? gig.platforms
  : JSON.parse(gig.platforms ?? '[]');

    const getShareUrl = (platform) => {
        const text = encodeURIComponent(shareText);
        const url = gig.image_urls?.[0]?.url ? encodeURIComponent(gig.image_urls[0].url) : '';
        const links = {
            whatsapp: `https://wa.me/?text=${text}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}%20${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
            instagram: 'https://www.instagram.com/',
            tiktok: 'https://www.tiktok.com/',
            youtube: 'https://www.youtube.com/',
        };
        return links[platform];
    };

    const handleDownload = (img) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `campaign-asset-${img.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const confirmAndProceed = () => {
        setShowReminder(false);
        router.visit(route('promoter.gigs.submit', gig.id));
    };

    const PLATFORM_CONFIG = {
        whatsapp: {
            label: 'WhatsApp',
            icon: '💬',
            className: 'bg-green-50 border-green-100 hover:bg-green-100 text-green-700',
        },
        twitter: {
            label: 'X',
            icon: '𝕏',
            className: 'bg-blue-50 border-blue-100 hover:bg-blue-100 text-blue-700',
        },
        facebook: {
            label: 'Facebook',
            icon: '👥',
            className: 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-700',
        },
        instagram: {
            label: 'Instagram',
            icon: '📸',
            className: 'bg-pink-50 border-pink-100 hover:bg-pink-100 text-pink-700',
        },
        tiktok: {
            label: 'TikTok',
            icon: '🎵',
            className: 'bg-purple-50 border-purple-100 hover:bg-purple-100 text-purple-700',
        },
        youtube: {
            label: 'YouTube',
            icon: '📺',
            className: 'bg-red-50 border-red-100 hover:bg-red-100 text-red-700',
        },
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
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none">{brandName}</span>
                                <span className="text-[8px] font-bold text-pink-600 uppercase tracking-widest mt-0.5">{gig.category || 'General'}</span>
                            </div>
                        </div>
                        <div className="w-10"></div>
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
                        <p className="text-gray-400 font-medium text-sm">For sharing this on {platforms.join(' & ')} </p>
                    </div>

                    {/* 3. KEY CRITERIA TILES */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Industry</p>
                            <p className="text-lg font-black text-pink-600 uppercase">{gig.category || 'General'}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Min. Followers</p>
                            <p className="text-lg font-black text-gray-900">{gig.min_followers?.toLocaleString() || '100'}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining Slots</p>
                            <p className="text-lg font-black text-gray-900">{gig.available_slots ?? 0}</p>
                        </div>
                    </div>

                    {/* 4. ASSETS PREVIEW */}
                    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-black text-gray-900 uppercase text-xs tracking-widest">Content to Share</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {gig.image_urls?.map((img) => (
                                <div key={img.id} className="relative group rounded-3xl overflow-hidden aspect-square bg-gray-50 border border-gray-100">
                                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <button onClick={() => handleDownload(img)} className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-2xl shadow-xl hover:bg-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. SHARE CHANNELS */}
                    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                    <h2 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6">
                        1-Click Share
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                        {platforms
                        .filter((platform) => PLATFORM_CONFIG[platform])
                        .map((platform) => {
                            const config = PLATFORM_CONFIG[platform];

                            return (
                            <a
                                key={platform}
                                href={getShareUrl(platform)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-colors ${config.className}`}
                            >
                                <span className="text-2xl">{config.icon}</span>
                                <span className="text-[10px] font-black uppercase">
                                {config.label}
                                </span>
                            </a>
                            );
                        })}
                    </div>
                    </div>

                </div>

                {/* 6. FLOATING ACTION BAR */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
                    <div className="max-w-3xl mx-auto">
                        {!hasSubmitted ? (
                            <button
                                onClick={() => setShowReminder(true)}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95"
                            >
                                Submit Proof of Share
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-center border border-gray-200">
                                Proof Already Submitted
                            </div>
                        )}
                    </div>
                </div>

              {/* 7. REMINDER MODAL */}
            {showReminder && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowReminder(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-pink-600 p-6 text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight leading-none">Pre-Submission Check</h3>
                            <p className="text-[10px] font-bold text-pink-200 uppercase mt-2 tracking-widest">Don't lose your payout!</p>
                        </div>
                        <div className="p-7">
                            <div className="space-y-5 mb-8">
                                {/* Step 1: 48 Hours */}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-[10px]">1</div>
                                    <p className="text-gray-600 text-[11px] font-bold leading-snug">Keep your post live for at least <span className="text-gray-900 underline">48 hours</span>.</p>
                                </div>

                                {/* Step 2: Followers */}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-[10px]">2</div>
                                    <p className="text-gray-600 text-[11px] font-bold leading-snug">Meet the <span className="text-gray-900">{gig.min_followers?.toLocaleString()} followers</span> requirement.</p>
                                </div>

                                {/* Step 3: Copy Link & Screenshot */}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px]">3</div>
                                    <div className="space-y-1">
                                        <p className="text-gray-900 text-[11px] font-black leading-snug">Action Required Now:</p>
                                        <p className="text-gray-500 text-[10px] font-bold leading-relaxed italic">
                                            Go to your post and <span className="text-blue-600">Copy the Link</span>, then take a <span className="text-blue-600">Full Screenshot</span> of your post.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-[9px] text-amber-700 font-black uppercase leading-tight text-center">
                                        Missing proof or early deletion = No Payout.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmAndProceed}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-pink-600 transition-colors active:scale-95"
                                >
                                    I have them, Proceed
                                </button>
                                                <button
                                                    onClick={() => setShowReminder(false)}
                                                    className="w-full py-2 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-widest"
                                                >
                                                    Go back to copy link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
            </div>
        </AuthenticatedLayout>
    );
}
