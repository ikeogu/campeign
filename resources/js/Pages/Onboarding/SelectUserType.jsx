import { Head, Link } from '@inertiajs/react';

export default function SelectUserType() {
    return (
        <>
            <Head title="Choose Your Path" />

            <div className="min-h-screen flex flex-col bg-[#fdfdfd] relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-green-50 blur-[120px] opacity-60"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-50 blur-[120px] opacity-60"></div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 px-4 py-16">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                            Getting Started
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            How will you use <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-purple-600">Gigs&Campaigns?</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            Whether you're here to grow your income or scale your brand's reach,
                            we have the perfect tools waiting for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

                        {/* PROMOTER CARD */}
                        <Link
                            href={route('onboarding.promoter')}
                            className="group relative p-8 bg-white rounded-3xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-green-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(22,163,74,0.1)]"
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">I'm a Promoter</h2>
                                <p className="text-gray-500 leading-relaxed mb-6">
                                    Earn between <span className="text-green-600 font-bold">₦200 – ₦500</span> for every task you complete and share.
                                </p>
                                <div className="inline-flex items-center text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                    Start Earning
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                            {/* Decorative background number/icon */}
                            <div className="absolute top-6 right-8 text-8xl font-black text-gray-50 group-hover:text-green-50/50 transition-colors pointer-events-none">01</div>
                        </Link>

                        {/* ADVERTISER CARD */}
                        <Link
                            href={route('onboarding.advertiser')}
                            className="group relative p-8 bg-white rounded-3xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(147,51,234,0.1)]"
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">I'm an Advertiser</h2>
                                <p className="text-gray-500 leading-relaxed mb-6">
                                    Put your brand in front of thousands of <span className="text-purple-600 font-bold">verified influencers.</span>
                                </p>
                                <div className="inline-flex items-center text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                    Create Campaign
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute top-6 right-8 text-8xl font-black text-gray-50 group-hover:text-purple-50/50 transition-colors pointer-events-none">02</div>
                        </Link>
                    </div>

                    <p className="mt-12 text-sm text-gray-400">
                        Need help deciding? <Link href="/contact" className="underline hover:text-gray-600">Contact our support team</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
