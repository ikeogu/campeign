import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head } from '@inertiajs/react';

const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
        case 'twitter': case 'x':
            return { name: 'X', classes: 'bg-blue-50 text-blue-600 border-blue-200' };
        case 'instagram':
            return { name: 'Instagram', classes: 'bg-pink-50 text-pink-600 border-pink-200' };
        case 'facebook':
            return { name: 'Facebook', classes: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
        case 'tiktok':
            return { name: 'TikTok', classes: 'bg-slate-900 text-slate-100 border-slate-700' };
        case 'youtube':
            return { name: 'YouTube', classes: 'bg-red-50 text-red-600 border-red-200' };
        default:
            return { name: platform, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
};

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

export default function PromoterCampaignIndex() {
    const { gigs, auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Available Gigs" />

            <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    {/* Catchy Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="inline-block animate-pulse mb-2 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                ● Live Now
                            </span>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                Trending <span className="text-pink-600">Active Gigs</span>
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium italic">
                                Promoters are currently earning from these campaigns right now.
                            </p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Available Payouts</p>
                            <p className="text-xl font-black text-green-600">
                                {formatCurrency(gigs.reduce((acc, gig) => acc + Number(gig.payout), 0))}
                            </p>
                        </div>
                    </div>

                    {gigs.length === 0 ? (
                        <div className="p-16 bg-white rounded-[3rem] text-center shadow-sm border border-gray-100">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <h3 className="text-2xl font-black text-gray-900">The vault is empty!</h3>
                            <p className="text-gray-500 mt-2 font-medium">New high-paying gigs land daily. Refresh in a bit.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gigs.map((gig) => {
                                const brandName = gig.user?.campaigner?.brand_name || "Exclusive Brand";
                                const brandLogo = gig.user?.campaigner?.logo_url;

                                return (
                                    <div key={gig.id} className="group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden">

                                        {/* 1. BRAND HEADER */}
                                        <div className="p-6 pb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-lg overflow-hidden border border-gray-100 shadow-inner">
                                                    {brandLogo ? (
                                                        <img src={brandLogo} className="w-full h-full object-cover" alt={brandName} />
                                                    ) : (
                                                        brandName.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 uppercase text-[13px] tracking-tight leading-none">{brandName}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-1">Campaign Active</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-green-600 font-black text-xl leading-none block">{formatCurrency(gig.payout)}</span>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Earnings</p>
                                            </div>
                                        </div>

                                        {/* 2. DYNAMIC VISUAL AREA */}
                                        <div className="mx-4 relative h-48 rounded-[2rem] bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-50 group-hover:bg-gray-100 transition-colors">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                                                <span className="text-8xl font-black italic uppercase -rotate-12">{brandName}</span>
                                            </div>

                                            <div className="relative z-10 transition-transform duration-700 group-hover:scale-110">
                                                {gig.image_urls?.[0] ? (
                                                    <img src={gig.image_urls[0].url} className="h-40 object-contain drop-shadow-2xl" alt="Campaign Asset" />
                                                ) : (
                                                    <span className="text-7xl drop-shadow-xl">📢</span>
                                                )}
                                            </div>

                                            <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                                                {gig.platforms?.slice(0, 2).map((p, idx) => (
                                                    <span key={idx} className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border shadow-sm ${getPlatformStyle(p).classes}`}>
                                                        {getPlatformStyle(p).name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. INFO & FOMO BAR */}
                                        <div className="p-6 flex-grow flex flex-col">
                                            {/* CATEGORY TAG ADDED HERE */}
                                            <span className="text-[9px] font-black text-pink-600 uppercase tracking-widest mb-1">
                                                {gig.category || 'General'}
                                            </span>

                                            <h2 className="font-black text-gray-900 text-lg leading-tight line-clamp-1 mb-2">
                                                {gig.title}
                                            </h2>

                                            <div className="mt-auto">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                                                    <span>Budget Used</span>
                                                    <span>{gig.completion_percentage || 0}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                                                    <div
                                                        className="h-full bg-pink-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${gig.completion_percentage || 0}%` }}
                                                    ></div>
                                                </div>

                                                <Link
                                                    href={route('promoter.gigs.show', gig.id)}
                                                    className="block w-full py-4 bg-gray-900 text-white rounded-2xl text-center font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-pink-600 transition-all active:scale-95 group-hover:shadow-pink-200"
                                                >
                                                    Share & Earn {formatCurrency(gig.payout)}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
