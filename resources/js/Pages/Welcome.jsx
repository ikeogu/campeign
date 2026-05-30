import { Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

export default function Landing({ liveGigs = [], brandLogos = [] }) {

    const staticGigs = [
        { id: 's1', title: 'Summer Collection', category: 'Fashion', user: { campaigner: { brand_name: 'Adidas' } }, platforms: ['instagram'], payout: 5000, completion_percentage: 82, status: 'active', emoji: '👟' },
        { id: 's2', title: 'Data Blowout', category: 'Telecom', user: { campaigner: { brand_name: 'MTN Nigeria' } }, platforms: ['tiktok'], payout: 3500, completion_percentage: 45, status: 'active', emoji: '📱' },
        { id: 's3', title: 'Jordan Launch', category: 'Sports', user: { campaigner: { brand_name: 'Nike Air' } }, platforms: ['twitter'], payout: 7000, completion_percentage: 100, status: 'completed', emoji: '🏀' },
        { id: 's4', title: 'Movie Night', category: 'Entertainment', user: { campaigner: { brand_name: 'Netflix' } }, platforms: ['facebook'], payout: 4200, completion_percentage: 100, status: 'completed', emoji: '🎬' },
        { id: 's5', title: 'New Arrival', category: 'Fashion', user: { campaigner: { brand_name: 'Zara' } }, platforms: ['instagram'], payout: 6000, completion_percentage: 30, status: 'active', emoji: '👗' },
    ];

    const displayGigs = liveGigs.length > 0 ? liveGigs : staticGigs;

    const platformColors = {
        whatsapp:  'bg-green-50 text-green-700 border-green-200',
        facebook:  'bg-blue-50 text-blue-700 border-blue-200',
        twitter:   'bg-sky-50 text-sky-700 border-sky-200',
        instagram: 'bg-brand-50 text-brand-700 border-brand-200',
        tiktok:    'bg-gray-900 text-white border-gray-800',
        youtube:   'bg-red-50 text-red-700 border-red-200',
        telegram:  'bg-indigo-50 text-indigo-700 border-indigo-200',
        snapchat:  'bg-yellow-50 text-yellow-800 border-yellow-200',
    };

    const steps = [
        { n: '01', title: 'Browse Gigs', desc: 'Explore active campaigns from verified brands across all categories.' },
        { n: '02', title: 'Share Content', desc: 'Post to your social media — WhatsApp, Instagram, Twitter, TikTok, and more.' },
        { n: '03', title: 'Get Paid', desc: 'Our AI verifies your share and instantly credits your wallet. Withdraw anytime.' },
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
            <Navbar auth={{ user: null }} />

            {/* ─── 1. LIVE GIGS (top — first thing visitors see) ───────────── */}
            <section className="pt-20 sm:pt-24 pb-10 sm:pb-14 bg-white border-b border-gray-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-3">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full mb-2 sm:mb-3">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">Live Now</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                                Active <span className="text-brand-600">Gigs</span>
                            </h2>
                            <p className="text-gray-400 mt-0.5 text-sm font-medium">Real campaigns, real payouts.</p>
                        </div>
                        <Link href={route('guest.gigs')} className="text-brand-600 font-black hover:text-brand-700 flex items-center gap-1.5 group text-sm self-start sm:self-auto">
                            Browse all gigs
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto pb-4 gap-4 sm:gap-5 no-scrollbar snap-x snap-mandatory">
                        {displayGigs.map((gig) => {
                            const brandName = gig.user?.campaigner?.company_name || gig.user?.campaigner?.brand_name || "Exclusive Brand";
                            const brandLogo = gig.user?.campaigner?.logo_url;
                            const isCompleted = gig.status === 'completed' || gig.completion_percentage >= 100;

                            return (
                                <div key={gig.id}
                                    className={`flex-none w-[260px] sm:w-72 snap-start group relative bg-white overflow-hidden rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="p-4 pb-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0">
                                                {brandLogo ? <img src={brandLogo} className="w-full h-full object-cover" alt={brandName} /> : brandName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-[10px] sm:text-[11px] uppercase tracking-tight leading-none truncate w-24">{brandName}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{gig.category || 'Campaign'}</p>
                                            </div>
                                        </div>
                                        <span className="text-brand-600 font-black text-sm">₦{Number(gig.payout).toLocaleString()}</span>
                                    </div>

                                    <div className="mx-3 sm:mx-4 h-36 sm:h-44 rounded-2xl bg-gradient-to-br from-gray-50 to-brand-50/30 border border-gray-100 flex items-center justify-center overflow-hidden relative">
                                        <span className="absolute inset-0 flex items-center justify-center text-6xl font-black italic text-gray-900/[0.03] select-none uppercase">{brandName}</span>
                                        <span className="text-5xl sm:text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10">
                                            {gig.image_urls?.[0] ? <img src={gig.image_urls[0].url} className="h-24 sm:h-28 object-contain" alt="Gig" /> : gig.emoji || '📢'}
                                        </span>
                                        {gig.platforms?.[0] && (
                                            <span className={`absolute top-2.5 left-2.5 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${platformColors[gig.platforms[0]?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {gig.platforms[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 pt-3">
                                        <p className="text-[12px] sm:text-[13px] font-black text-gray-900 mb-2.5 truncate">{gig.title || "Promote our Brand"}</p>
                                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                            <div className="h-1.5 flex-grow bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-500 transition-all" style={{ width: `${gig.completion_percentage}%` }} />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-400">{gig.completion_percentage}%</span>
                                        </div>
                                        <Link href={route('login')}
                                            className="block w-full py-3 rounded-2xl text-center text-white font-black text-[10px] uppercase tracking-[0.15em] bg-gray-900 hover:bg-brand-600 transition-all active:scale-95 shadow-sm">
                                            Share & Earn
                                        </Link>
                                    </div>

                                    {isCompleted && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] z-20">
                                            <span className="bg-gray-900 text-white text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest">Budget Reached</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── 2. HERO ─────────────────────────────────────────────────── */}
            <section className="relative flex flex-col justify-center overflow-hidden py-16 sm:py-24 md:py-32">

                {/* Dot-grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #CC550015 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                {/* Glow blob — smaller on mobile */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] bg-brand-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">

                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-brand-50 border border-brand-200 rounded-full mb-6 sm:mb-10 relative">
                        <span className="w-2 h-2 bg-brand-600 rounded-full animate-ping absolute left-3"></span>
                        <span className="w-2 h-2 bg-brand-600 rounded-full ml-4"></span>
                        <span className="text-brand-700 text-[10px] sm:text-xs font-black uppercase tracking-widest">Promoters Earning Right Now</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6 sm:mb-8">
                        Share brands.<br />
                        <span className="text-brand-600">Get paid.</span><br />
                        Every time.
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-500 font-medium max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
                        Connect with top brands, share verified content, and earn real money for every confirmed share.
                    </p>

                    {/* CTA buttons — stacked on mobile, side-by-side on sm+ */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 sm:px-0">
                        <Link href={route('register')}
                            className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-brand-600 text-white font-black rounded-2xl text-base sm:text-lg shadow-2xl shadow-brand-200 hover:bg-brand-700 hover:scale-105 transition-all active:scale-95 text-center">
                            Start Earning Free
                        </Link>
                        <Link href={route('login')}
                            className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-white text-gray-900 border-2 border-gray-200 font-black rounded-2xl text-base sm:text-lg hover:border-brand-300 hover:text-brand-600 transition-all text-center">
                            Sign In
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 sm:gap-10 md:gap-16 flex-wrap">
                        {[
                            { value: '10K+', label: 'Active Promoters' },
                            { value: '500+', label: 'Brand Campaigns' },
                            { value: '₦50M+', label: 'Paid Out' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-brand-600">{s.value}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator — hidden on very small screens */}
                <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Scroll</span>
                    <div className="w-px h-6 bg-gradient-to-b from-brand-300 to-transparent"></div>
                </div>
            </section>

            {/* ─── 2. PLATFORM TICKER ──────────────────────────────────────── */}
            <section className="py-8 sm:py-10 border-y border-gray-100 bg-gray-50 overflow-hidden">
                <div className="flex items-center gap-4 sm:gap-6 animate-[scroll_25s_linear_infinite] whitespace-nowrap">
                    {['Facebook', 'Instagram', 'WhatsApp', 'TikTok', 'Twitter', 'YouTube', 'Telegram', 'Snapchat',
                      'Facebook', 'Instagram', 'WhatsApp', 'TikTok', 'Twitter', 'YouTube', 'Telegram', 'Snapchat'].map((p, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-bold text-gray-600 shadow-sm shrink-0">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-400 inline-block shrink-0"></span>
                            {p}
                        </span>
                    ))}
                </div>
                <style>{`
                    @keyframes scroll {
                        0%   { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>
            </section>

            {/* ─── 3. HOW IT WORKS ─────────────────────────────────────────── */}
            <section className="py-16 sm:py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-16">
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-brand-500 mb-3">Simple Process</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Earn in <span className="text-brand-600">3 steps</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                        {/* Connecting line — desktop only */}
                        <div className="hidden md:block absolute top-14 left-[22%] right-[22%] h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

                        {steps.map((step) => (
                            <div key={step.n} className="flex md:flex-col items-start md:items-center gap-5 md:gap-0 md:text-center group
                                bg-brand-50/40 md:bg-transparent rounded-2xl md:rounded-none p-5 md:p-0 border border-brand-100/60 md:border-0">
                                <div className="w-16 h-16 md:w-28 md:h-28 shrink-0 md:mx-auto md:mb-8 rounded-2xl md:rounded-[2rem] bg-white md:bg-brand-50 border-2 border-brand-100 flex items-center justify-center group-hover:bg-brand-600 group-hover:border-brand-600 transition-all duration-300 shadow-sm md:shadow-lg md:shadow-brand-100/50">
                                    <span className="text-xl md:text-4xl font-black text-brand-600 group-hover:text-white transition-colors">{step.n}</span>
                                </div>
                                <div>
                                    <h3 className="text-base md:text-xl font-black text-gray-900 mb-1 md:mb-3">{step.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed md:max-w-xs md:mx-auto">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 4. FOR PROMOTERS / ADVERTISERS ─────────────────────────── */}
            <section className="py-14 sm:py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-16 md:mb-20">
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-brand-500 mb-3">Built for Everyone</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
                            One platform. <span className="text-brand-600">Two sides.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-5 sm:mb-8">
                        {/* Promoters card */}
                        <div className="group bg-brand-50 border-2 border-brand-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 hover:bg-brand-600 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-200 hover:border-brand-600">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center mb-5 sm:mb-8 shadow-sm group-hover:shadow-none group-hover:bg-white/20 transition-all shrink-0">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 group-hover:text-brand-200 mb-2 transition-colors">For Promoters</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-white mb-3 sm:mb-4 transition-colors leading-tight">Turn your audience into income</h3>
                            <p className="text-gray-500 group-hover:text-brand-100 font-medium leading-relaxed mb-5 sm:mb-8 transition-colors text-sm sm:text-base">
                                Browse active campaigns, share to your social circles, and earn instant wallet credits for every verified share.
                            </p>
                            <ul className="space-y-2.5 sm:space-y-3">
                                {['Instant wallet credits on every share', 'Works on all major platforms', 'Withdraw earnings anytime'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-700 group-hover:text-brand-100 transition-colors">
                                        <span className="w-5 h-5 rounded-full bg-brand-600 group-hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Advertisers card */}
                        <div className="group bg-gray-900 border-2 border-gray-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 hover:bg-brand-600 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-200 hover:border-brand-600">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-8 group-hover:bg-white/20 transition-all shrink-0">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-200 mb-2 transition-colors">For Advertisers</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 leading-tight">Reach real people, not bots</h3>
                            <p className="text-gray-400 group-hover:text-brand-100 font-medium leading-relaxed mb-5 sm:mb-8 transition-colors text-sm sm:text-base">
                                List your campaign in minutes. Real humans share your content to genuine social circles. Pay only for verified shares.
                            </p>
                            <ul className="space-y-2.5 sm:space-y-3">
                                {['AI-verified shares only', 'Funds held safely in escrow', 'Live campaign analytics'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-300 group-hover:text-brand-100 transition-colors">
                                        <span className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Auto-payments strip */}
                    <div className="bg-gray-50 border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-600 rounded-2xl flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base sm:text-xl font-black text-gray-900 mb-1">Auto-Payments, Always On</h3>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">Our verification engine runs 24/7 — shares checked, wallets credited, campaigns updated automatically.</p>
                        </div>
                        <Link href={route('register')}
                            className="w-full sm:w-auto shrink-0 px-6 sm:px-8 py-3 sm:py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all text-xs sm:text-sm uppercase tracking-widest text-center">
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── 6. VALUE PROP (burnt orange) ────────────────────────────── */}
            <section className="py-4 sm:py-6 px-3 sm:px-4 md:px-8 mb-4 sm:mb-6">
                <div className="max-w-7xl mx-auto bg-brand-600 rounded-[2rem] sm:rounded-[3rem] px-5 sm:px-8 md:px-16 py-12 sm:py-16 md:py-20 relative overflow-hidden shadow-2xl shadow-brand-200">
                    <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full -mr-32 sm:-mr-48 -mt-32 sm:-mt-48 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-brand-800/30 rounded-full -ml-24 sm:-ml-32 -mb-24 sm:-mb-32 blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic mb-4 sm:mb-6 leading-tight">
                                Built for the next generation of promoters.
                            </h2>
                            <p className="text-brand-100 text-base sm:text-lg font-medium mb-6 sm:mb-10 leading-relaxed">
                                We've removed the middleman. Advertisers list their content, you share it, and our AI-driven verification system pays you instantly.
                            </p>
                            <div className="space-y-3 sm:space-y-4">
                                {['Instant Wallet Credits', 'Verified Social Shares Only', 'Low Withdrawal Minimums', 'No Hidden Fees'].map(item => (
                                    <div key={item} className="flex items-center gap-3 sm:gap-4 font-bold text-white text-sm sm:text-base md:text-lg">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center shrink-0">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Link href={route('register')}
                                className="inline-block mt-8 sm:mt-10 px-8 sm:px-10 py-4 sm:py-5 bg-white text-brand-600 font-black rounded-2xl hover:bg-brand-50 transition-all text-sm sm:text-base uppercase tracking-widest shadow-xl">
                                Join for Free
                            </Link>
                        </div>

                        {/* Stats card — hidden on small mobile to avoid overflow */}
                        <div className="hidden sm:block bg-white/15 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-2 tracking-tighter">₦50M+</div>
                                <p className="text-brand-200 font-bold uppercase tracking-widest text-xs sm:text-sm">Distributed to promoters</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                                {[82, 55, 100].map((pct, i) => (
                                    <div key={i} className="bg-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                                        <div className="text-lg sm:text-xl font-black text-white">{pct}%</div>
                                        <div className="text-white/60 text-[9px] sm:text-[10px] font-bold uppercase mt-0.5">{['Funded', 'Active', 'Completed'][i]}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-white rounded-full" />
                            </div>
                            <p className="text-white/60 text-xs font-bold text-center mt-2 sm:mt-3 uppercase tracking-wider">Platform Growth 2025</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── 7. STATS ────────────────────────────────────────────────── */}
            <section className="py-14 sm:py-20 md:py-24 bg-white border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100">
                        {[
                            { value: '10K+', label: 'Active Promoters', sub: 'Across Nigeria' },
                            { value: '500+', label: 'Campaigns Run', sub: 'Verified brands' },
                            { value: '₦500k', label: 'Max Payout', sub: 'Single campaign' },
                        ].map(s => (
                            <div key={s.label} className="px-2 sm:px-8 md:px-12 py-8 text-center">
                                <div className="text-3xl sm:text-5xl md:text-6xl font-black text-brand-600 mb-2 sm:mb-3">{s.value}</div>
                                <p className="font-black text-gray-900 uppercase tracking-widest text-[9px] sm:text-xs mb-1">{s.label}</p>
                                <p className="text-gray-400 text-[9px] sm:text-xs font-medium hidden sm:block">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 8. FINAL CTA ────────────────────────────────────────────── */}
            <section className="py-6 sm:py-12 px-3 sm:px-4 md:px-8 mb-10 sm:mb-20">
                <div className="max-w-5xl mx-auto bg-gray-900 rounded-[2rem] sm:rounded-[3rem] py-12 sm:py-16 md:py-20 px-5 sm:px-8 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-gray-900 to-brand-800/20 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-brand-600/20 border border-brand-500/30 rounded-full mb-5 sm:mb-8">
                            <span className="text-brand-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">Free to Join</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
                            Ready to start<br /><span className="text-brand-400">earning?</span>
                        </h2>
                        <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-10 max-w-lg mx-auto font-medium px-2">
                            Thousands of promoters are earning right now. Your wallet is one share away.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                            <Link href={route('register')}
                                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-brand-600 text-white font-black rounded-2xl text-base sm:text-lg hover:bg-brand-500 hover:scale-105 transition-all shadow-2xl shadow-brand-900/50 active:scale-95 text-center">
                                Create Free Account
                            </Link>
                            <Link href={route('guest.gigs')}
                                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-white/10 text-white font-black rounded-2xl text-base sm:text-lg hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-center">
                                Browse Gigs First
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
