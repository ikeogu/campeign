import { Link } from "@inertiajs/react";
//import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

export default function Landing({ liveGigs = [], brandLogos = [] }) {

    const getPlatformStyle = (platform) => {
        const styles = {
            twitter: 'bg-blue-50 text-blue-600 border-blue-100',
            instagram: 'bg-pink-50 text-pink-600 border-pink-100',
            tiktok: 'bg-slate-900 text-white border-slate-700',
            whatsapp: 'bg-green-50 text-green-600 border-green-100',
            facebook: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
        return styles[platform?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
    };

    const socialPlatforms = [
        "Facebook", "Youtube", "Instagram", "Whatsapp",
        "WeChat", "Telegram", "Tiktok", "Snapchat", "Twitter"
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-pink-100 selection:text-pink-900">

            {/* 1. LIVE GIGS TEASER */}
            <section className="py-16 bg-gray-50 border-b border-gray-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <span className="inline-block animate-pulse mb-2 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                ● Live Now
                            </span>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                Trending <span className="text-pink-600">Active Gigs</span>
                            </h2>
                            <p className="text-gray-500 mt-1 text-sm font-medium italic">Promoters are currently earning from these campaigns.</p>
                        </div>
                        <Link href={route('guest.gigs')} className="text-pink-600 font-bold hover:underline flex items-center gap-2 group text-sm">
                            View all active campaigns
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="flex overflow-x-auto pb-8 gap-6 snap-x no-scrollbar">
                        {[
                            { id: 1, brand: 'Adidas', platform: 'instagram', amount: '5,000', progress: '82%', color: 'bg-pink-600', img: '👟' },
                            { id: 2, brand: 'MTN Nigeria', platform: 'tiktok', amount: '3,500', progress: '45%', color: 'bg-slate-900', img: '📱' },
                            { id: 3, brand: 'Nike Air', platform: 'twitter', amount: '7,000', progress: '100%', color: 'bg-blue-600', img: '🏀' },
                            { id: 4, brand: 'Netflix', platform: 'facebook', amount: '4,200', progress: '100%', color: 'bg-indigo-600', img: '🎬' },
                        ].map((gig) => (
                            <div
                                key={gig.id}
                                className={`flex-none w-[300px] md:w-[320px] snap-start group relative bg-white overflow-hidden rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:shadow-2xl hover:border-pink-200
                                    ${gig.id > 2 ? 'opacity-60 grayscale pointer-events-none' : 'opacity-100'}`}
                            >
                                {/* Brand Header */}
                                <div className="p-5 pb-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm">
                                                {gig.brand.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 leading-none uppercase text-[12px] tracking-tight">{gig.brand}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold">Campaign active</p>
                                            </div>
                                        </div>
                                        <span className="text-green-600 font-black text-sm">₦{gig.amount}</span>
                                    </div>
                                </div>

                                {/* Reworked Product Visual Area (Larger & Bolder) */}
                                <div className="mx-4 relative h-48 rounded-[2rem] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center border border-gray-100/50">
                                    {/* Background subtle watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
                                        <span className="text-8xl font-black italic uppercase tracking-tighter">{gig.brand}</span>
                                    </div>

                                    {/* Main Image/Icon - Size increased to text-7xl */}
                                    <div className="text-7xl filter drop-shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                                        {gig.img}
                                    </div>

                                    <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm ${getPlatformStyle(gig.platform)}`}>
                                        {gig.platform}
                                    </span>
                                </div>

                                {/* Footer Info & Action */}
                                <div className="p-5 pt-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-2 flex-grow bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-pink-500 transition-all duration-700" style={{ width: gig.progress }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500">{gig.progress}</span>
                                    </div>

                                    <Link
                                        href={route('login')}
                                        className={`block w-full py-3.5 rounded-2xl text-center text-white font-black text-[11px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg hover:brightness-110 ${gig.color}`}
                                    >
                                        Share & Earn
                                    </Link>
                                </div>

                                {/* Budget Reached Overlay */}
                                {gig.id > 2 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-20">
                                        <span className="bg-gray-900 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-tighter shadow-xl">
                                            Budget Reached
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scrollbar hide helper */}
                <style dangerouslySetInnerHTML={{ __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </section>


            {/* 2. HERO & LOGO WALL SECTION */}
           <section className="relative overflow-hidden py-32 bg-gray-50/50"> {/* Added subtle background color */}
                {/* LOGO WALL BACKGROUND */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
                    <div className="grid grid-cols-6 gap-12 rotate-12 scale-150">
                        {(brandLogos.length > 0 ? brandLogos : Array(24).fill('/logo-placeholder.png')).map((logo, i) => (
                            <img key={i} src={logo} alt="brand" className="w-24 grayscale" />
                        ))}
                    </div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.05] tracking-tight">
                        Share brands you <span className="text-pink-600 italic">genuinely like,</span> get paid for every share.
                    </h1>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12">
                        Earn without limits. Connect with top brands, share verified content to your social circles, and watch your wallet grow.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={route('register')} className="px-10 py-5 bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-200 hover:bg-pink-700 hover:scale-105 transition-all text-lg">
                            Get Started
                        </Link>
                        <Link href={route('login')} className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 font-black rounded-2xl hover:bg-gray-50 transition-all text-lg">
                            Login
                        </Link>
                    </div>

                    {/* PLATFORM LIST */}
                    <div className="mt-20">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Supported Platforms</p>
                        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
                            {socialPlatforms.map((platform) => {
                                // Mapping dynamic colors based on platform name
                                const colors = {
                                    whatsapp: 'bg-green-50 text-green-700 border-green-100 hover:border-green-400',
                                    facebook: 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-400',
                                    twitter: 'bg-sky-50 text-sky-700 border-sky-100 hover:border-sky-400',
                                    instagram: 'bg-pink-50 text-pink-700 border-pink-100 hover:border-pink-400',
                                    tiktok: 'bg-slate-100 text-slate-900 border-slate-200 hover:border-slate-500',
                                    youtube: 'bg-red-50 text-red-700 border-red-100 hover:border-red-400',
                                    telegram: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-400',
                                    snapchat: 'bg-yellow-50 text-yellow-800 border-yellow-100 hover:border-yellow-400',
                                };

                                const colorStyle = colors[platform.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200 hover:border-pink-300';

                                return (
                                    <div
                                        key={platform}
                                        className={`px-5 py-3 rounded-2xl border shadow-sm font-bold text-sm transition-all cursor-default ${colorStyle}`}
                                    >
                                        {platform}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. ORIGINAL FEATURES SECTION (Refined) */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center text-gray-900 mb-16 tracking-tight">
                        A Platform Built for <span className="text-green-600">Both Sides</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Promoters */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.6560.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black mb-4">For Promoters</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Turn your social presence into a paycheck. Earn unlimited per share. Simple tasks, instant wallet credits.
                            </p>
                        </div>

                        {/* Advertisers */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black mb-4">For Advertisers</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Reach authentic, verified audiences. Launch campaigns in minutes and pay only for actual, trackable shares.
                            </p>
                        </div>

                        {/* Automation */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black mb-4">Auto-Payments</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                No manual processing. Funds are secured in escrow and moved automatically once the share is verified.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HIGH CONTRAST VALUE PROP (Green Card) */}
            <section className="py-24 bg-green-600 text-white rounded-[4rem] mx-4 mb-10 shadow-3xl shadow-green-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="max-w-6xl mx-auto px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight italic">Built for the next generation of promoters.</h2>
                            <p className="text-green-50 text-xl font-medium mb-10 leading-relaxed opacity-90">
                                We've removed the middleman. Advertisers list their content, you share it, and our AI-driven verification system pays you instantly.
                            </p>
                            <div className="space-y-5">
                                {['Instant Wallet Credits', 'Verified Social Shares', 'Low Withdrawal Minimums'].map(item => (
                                    <div key={item} className="flex items-center gap-4 font-black text-lg">
                                        <div className="p-1 bg-white rounded-full">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/10 p-12 rounded-[3rem] border border-white/20 backdrop-blur-xl shadow-inner">
                            <div className="text-center mb-10">
                                <div className="text-6xl font-black mb-2 tracking-tighter">₦50M+</div>
                                <p className="text-green-100 font-bold uppercase tracking-widest text-sm">Distributed to users</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-24 bg-white/20 rounded-2xl animate-pulse"></div>
                                <div className="h-24 bg-white/20 rounded-2xl animate-pulse delay-75"></div>
                                <div className="h-24 bg-white/20 rounded-2xl animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. STATS SECTION */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-center">
                        <div className="p-8 border-r border-gray-100 last:border-0">
                            <div className="text-5xl font-black text-pink-600 mb-2">10K+</div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Active Promoters</p>
                        </div>
                        <div className="p-8 border-r border-gray-100 last:border-0">
                            <div className="text-5xl font-black text-green-600 mb-2">500+</div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Campaigns Run</p>
                        </div>
                        <div className="col-span-2 md:col-span-1 p-8">
                            <div className="text-5xl font-black text-blue-600 mb-2">₦500k</div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Max Single Payout</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. FINAL CTA SECTION */}
            <section className="py-24 mb-20">
                <div className="max-w-4xl mx-auto text-center px-4 bg-gray-900 text-white rounded-[3rem] py-20 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-green-600/20"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Get Started?</h2>
                        <p className="text-xl mb-10 text-gray-400 max-w-lg mx-auto font-medium">
                            Join thousands of promoters and advertisers growing their presence today.
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-block px-12 py-5 bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-900/40 hover:bg-pink-700 hover:scale-105 transition-all text-lg"
                        >
                            Create Your Free Account
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
