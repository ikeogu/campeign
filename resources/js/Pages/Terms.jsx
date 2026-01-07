import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Footer from "@/Components/Footer";

export default function TermsAndConditions() {
    return (
        <div className="bg-white min-h-screen font-sans selection:bg-pink-100">
            <Head title="Terms and Conditions" />

            {/* SIMPLE NAVIGATION HEADER */}
            <nav className="bg-white border-b border-gray-100 py-6 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="text-xl font-black tracking-tighter text-gray-900">
                        GIGS & <span className="text-pink-600">CAMPAIGNS</span>
                    </Link>
                    <Link
                        href={route('register')}
                        className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-pink-600 transition-colors"
                    >
                        Back to Signup
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                {/* PAGE TITLE */}
                <div className="mb-12">
                    <span className="text-pink-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">
                        Legal Agreement
                    </span>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-6">
                        Terms of <span className="text-pink-600">Service</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Last updated: January 2026</p>
                </div>

                {/* CONTENT SECTION */}
                <div className="prose prose-pink max-w-none">
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-8">

                        <section>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs">1</span>
                                Campaign Content Disclaimer
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Gigs and Campaigns operates solely as a technology-enabled marketplace that allows advertisers to upload campaigns and independent users to voluntarily participate in campaign distribution. Gigs and Campaigns does not create, endorse, verify, edit, approve, or guarantee the accuracy or legality of any campaign content made available on the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">2</span>
                                Advertiser Responsibility
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                All advertisers are solely responsible for the content they upload, including its accuracy, legality, originality, and compliance with all applicable laws, regulations, and third-party rights. This includes, but is not limited to, intellectual property rights, advertising standards, consumer protection laws, political communication regulations, and data privacy requirements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">3</span>
                                Disclaimer of Liability
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Gigs and Campaigns expressly disclaims all liability arising from the publication, distribution, performance, or outcomes of any campaign content. This includes, without limitation, claims relating to misinformation, misrepresentation, infringement, reputational damage, financial loss, or any harm suffered by users or third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">4</span>
                                User Discretion
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Users who choose to engage in, distribute, or promote campaigns do so voluntarily and at their own discretion, and are solely responsible for ensuring their participation complies with applicable laws and platform guidelines.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">5</span>
                                Right to Review
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Gigs and Campaigns reserves the right, but not the obligation, to review, restrict, suspend, or remove any campaign or account that violates platform policies or applicable laws, at any time and without prior notice.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-gray-200">
                            <div className="bg-pink-50 border border-pink-100 p-6 rounded-3xl">
                                <h4 className="font-black text-pink-600 uppercase text-xs tracking-widest mb-2 text-center">Indemnification Clause</h4>
                                <p className="text-[13px] text-pink-900 font-bold leading-relaxed text-center italic">
                                    "By uploading, sharing, or participating in campaigns on Gigs and Campaigns, all parties agree to indemnify, defend, and hold harmless Gigs and Campaigns from and against any claims, liabilities, damages, losses, costs, or expenses arising directly or indirectly from such campaigns or related activities."
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* CALL TO ACTION */}
                <div className="mt-16 text-center">
                    <Link
                        href={route('register')}
                        className="inline-block bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-pink-600 transition-all active:scale-95"
                    >
                        Accept & Continue
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
