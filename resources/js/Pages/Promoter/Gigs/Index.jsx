import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
        case 'twitter': case 'x':
            return { name: 'X', classes: 'bg-blue-50 text-blue-600 border-blue-200' };
        case 'instagram':
            return { name: 'Instagram', classes: 'bg-brand-50 text-brand-600 border-brand-200' };
        case 'facebook':
            return { name: 'Facebook', icon: '👥', classes: 'bg-brand-50 text-brand-600 border-brand-200' };
        case 'tiktok':
            return { name: 'TikTok', icon: '🎵', classes: 'bg-slate-900 text-slate-100 border-slate-700' };
        case 'youtube':
            return { name: 'YouTube', icon: '📺', classes: 'bg-red-50 text-red-600 border-red-200' };
        default:
            return { name: platform, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
};

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

function ReferralPromoCard({ referralCode, referralTerms }) {
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    const sharePercent = referralTerms?.sharePercent ?? 50;
    const campaignLimit = referralTerms?.campaignLimit ?? 1;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl">
                    <span className="inline-block mb-3 px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-100">
                        Referral Program
                    </span>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
                        Invite an Advertiser, Earn a Commission
                    </h2>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">
                        Share your link with a brand or business. When they sign up as an advertiser and fund their first
                        campaign using your referral code, you earn {sharePercent}% of the platform's management fee on
                        that campaign — paid straight into your wallet automatically.
                    </p>
                </div>

                <div className="flex-shrink-0 w-full lg:w-auto lg:min-w-[22rem]">
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-2xl flex items-center gap-2 shadow-sm">
                        <code className="flex-1 min-w-0 truncate text-[11px] font-bold text-brand-600 px-3 uppercase">
                            {referralLink}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="flex-shrink-0 bg-gray-900 text-white text-[10px] font-black uppercase px-4 py-3 rounded-xl hover:bg-brand-600 transition-all active:scale-95"
                        >
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Terms</p>
                <ul className="space-y-1.5 text-[11px] text-gray-500 font-medium">
                    <li>• Applies to new advertiser accounts only — the link must be used at sign-up.</li>
                    <li>
                        • Commission is paid once {campaignLimit > 1 ? `the advertiser's first ${campaignLimit} fee-bearing campaigns are funded` : "the advertiser's first fee-bearing campaign is funded"}, not on every campaign after that.
                    </li>
                    <li>• Trial campaigns (which carry no management fee) don't trigger a payout.</li>
                    <li>• Credited automatically to your wallet balance — no claim or request needed.</li>
                </ul>
            </div>
        </div>
    );
}

export default function PromoterCampaignIndex() {
    const { gigs, auth, referralTerms } = usePage().props;

    // 1. UPDATED SORTING LOGIC: Check both Percentage AND Status
    const sortedGigs = useMemo(() => {
        return [...gigs].sort((a, b) => {
            const aFinished = (a.completion_percentage || 0) >= 100 || a.status === 'completed';
            const bFinished = (b.completion_percentage || 0) >= 100 || b.status === 'completed';

            if (aFinished && !bFinished) return 1;
            if (!aFinished && bFinished) return -1;
            return 0;
        });
    }, [gigs]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Available Gigs" />

            <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto">

                    {/* Header Section */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="inline-block animate-pulse mb-2 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                ● Live Now
                            </span>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                Trending <span className="text-brand-600">Active Gigs</span>
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium italic">
                                Grab these opportunities before the budget runs out.
                            </p>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-[2rem] border border-gray-200 shadow-sm text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Potential Total</p>
                            <p className="text-2xl font-black text-brand-600">
                                {formatCurrency(gigs.reduce((acc, gig) => acc + Number(gig.payout), 0))}
                            </p>
                        </div>
                    </div>

                    <ReferralPromoCard referralCode={auth.user.referral_code} referralTerms={referralTerms} />

                    {sortedGigs.length === 0 ? (
                        <div className="p-16 bg-white rounded-[3rem] text-center shadow-sm border border-gray-100">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <h3 className="text-2xl font-black text-gray-900">The vault is empty!</h3>
                            <p className="text-gray-500 mt-2 font-medium">New gigs land daily. Refresh soon.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedGigs.map((gig, index) => {
                                const brandName = gig.user?.campaigner?.brand_name || "Exclusive Brand";
                                const brandLogo = gig.user?.campaigner?.logo_url;

                                // 2. UPDATED UI STATE LOGIC
                                const isFinished = (gig.completion_percentage || 0) >= 100 || gig.status === 'completed';
                                const isFirstFinished = isFinished && (index === 0 || !((sortedGigs[index - 1].completion_percentage || 0) >= 100 || sortedGigs[index - 1].status === 'completed'));

                                return (
                                    <React.Fragment key={gig.id}>
                                        {/* SECTION SEPARATOR */}
                                        {isFirstFinished && (
                                            <div className="col-span-full mt-12 mb-6">
                                                <div className="flex items-center gap-6">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] whitespace-nowrap">Successfully Completed</h3>
                                                    <div className="h-[1px] w-full bg-gray-200"></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-all duration-500 flex flex-col overflow-hidden
                                            ${isFinished
                                                ? 'grayscale opacity-60 pointer-events-none'
                                                : 'hover:shadow-2xl hover:-translate-y-2'
                                            }`}>

                                            {/* BRAND HEADER */}
                                            <div className="p-6 pb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-lg overflow-hidden border border-gray-100">
                                                        {brandLogo ? <img src={brandLogo} className="w-full h-full object-cover" /> : brandName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 uppercase text-[13px] tracking-tight">{brandName}</h4>
                                                        <p className={`text-[10px] font-bold mt-1 ${isFinished ? 'text-gray-400' : 'text-brand-500'}`}>
                                                            {isFinished ? 'Ended' : 'Active'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`${isFinished ? 'text-gray-400' : 'text-brand-600'} font-black text-xl block leading-none`}>
                                                        {formatCurrency(gig.payout)}
                                                    </span>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Per Task</p>
                                                </div>
                                            </div>

                                            {/* ASSET AREA */}
                                            <div className="mx-4 relative h-44 rounded-[2rem] bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-50">
                                                <div className="relative z-10 transition-transform duration-700 group-hover:scale-110">
                                                    {gig.image_urls?.[0] ? (
                                                        gig.image_urls[0].is_video ? (
                                                            <video src={gig.image_urls[0].url} className="h-32 object-contain drop-shadow-2xl" muted playsInline preload="metadata" />
                                                        ) : (
                                                            <img src={gig.image_urls[0].url} className="h-32 object-contain drop-shadow-2xl" />
                                                        )
                                                    ) : <span className="text-6xl">📢</span>}
                                                </div>
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                                                    {gig.platforms?.map((p, idx) => (
                                                        <span key={idx} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${getPlatformStyle(p).classes}`}>
                                                            {getPlatformStyle(p).name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* PROGRESS & ACTION */}
                                            <div className="p-6 flex-grow flex flex-col">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{gig.category || 'Campaign'}</span>
                                                <h2 className="font-black text-gray-900 text-lg leading-tight line-clamp-2 mb-6">{gig.title}</h2>

                                                <div className="mt-auto">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                                                        <span>Progress</span>
                                                        <span className={isFinished ? 'text-red-500' : 'text-gray-900'}>{gig.completion_percentage || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${isFinished ? 'bg-gray-400' : 'bg-brand-500'}`}
                                                            style={{ width: `${Math.min(gig.completion_percentage || 0, 100)}%` }}
                                                        ></div>
                                                    </div>

                                                    {isFinished ? (
                                                        <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest border border-gray-200">
                                                            {gig.status === 'completed' ? 'Campaign Finished' : 'Budget Exhausted'}
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={route('promoter.gigs.show', gig.id)}
                                                            className="block w-full py-4 bg-gray-900 text-white rounded-2xl text-center font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-brand-600 transition-all active:scale-95"
                                                        >
                                                            Start Earning
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
