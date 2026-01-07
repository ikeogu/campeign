import { Head, Link } from '@inertiajs/react';

export default function SelectUserType() {
    return (
        <>
            <Head title="Choose Your Path" />

            {/* --- MAIN WRAPPER WITH "CONNECTIVITY" BACKGROUND --- */}
            <div
                className="min-h-screen relative flex flex-col bg-cover bg-center bg-no-repeat"
                style={{
                    // This image represents a network of people/digital nodes
                    backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop')`
                }}
            >
                {/* Dark Gradient Overlay for high contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-900/70 backdrop-blur-[2px]"></div>

                <div className="relative flex flex-col items-center justify-center flex-1 px-4 py-16 z-10">

                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block shadow-2xl">
                            The Ecosystem
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                            Your Journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Starts Here.</span>
                        </h1>
                        <p className="text-indigo-100/80 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                            Join the marketplace where brands meet influence. Choose your role to access your personalized dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

                        {/* PROMOTER CARD */}
                        <Link
                            href={route('onboarding.promoter')}
                            className="group relative p-10 bg-white/5 backdrop-blur-xl rounded-[3rem] transition-all duration-500 hover:-translate-y-3 border border-white/10 hover:border-green-400/50 shadow-2xl overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-green-400/20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-green-400/30">
                                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Promoter</h2>
                                <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                                    Monetize your social reach. Earn <span className="text-green-400 font-black italic">Unlimited</span> per task.
                                </p>
                                <div className="inline-flex items-center text-xs font-black uppercase tracking-widest text-white bg-green-600 px-8 py-4 rounded-2xl group-hover:bg-green-500 transition-all duration-300 shadow-xl shadow-green-900/20">
                                    Open Wallet
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                            {/* Decorative background number */}
                            <div className="absolute -bottom-6 -right-4 text-[12rem] font-black text-white opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none select-none">01</div>
                        </Link>

                        {/* ADVERTISER CARD */}
                        <Link
                            href={route('onboarding.advertiser')}
                            className="group relative p-10 bg-white/5 backdrop-blur-xl rounded-[3rem] transition-all duration-500 hover:-translate-y-3 border border-white/10 hover:border-indigo-400/50 shadow-2xl overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-indigo-400/20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-indigo-400/30">
                                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Advertiser</h2>
                                <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                                    Scale your brand. Deploy campaigns to <span className="text-indigo-400 font-black italic">thousands</span> of users instantly.
                                </p>
                                <div className="inline-flex items-center text-xs font-black uppercase tracking-widest text-white bg-indigo-600 px-8 py-4 rounded-2xl group-hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-900/20">
                                    Launch Gigs
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-4 text-[12rem] font-black text-white opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none select-none">02</div>
                        </Link>
                    </div>

                    <p className="mt-16 text-sm text-white/40 font-bold uppercase tracking-widest">
                        Trusted by over 5,000+ Nigerian Creators
                    </p>
                </div>
            </div>
        </>
    );
}
