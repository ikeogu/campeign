import { Head, useForm } from '@inertiajs/react';

export default function AdvertiserOnboard() {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        website: '',
        bio: '',
        industry: '',
        user_type: 'advertizer',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // --- URL FORMATTING LOGIC ---

       // 1. Prepare the final URL
        let finalWebsite = data.website.trim();
        if (finalWebsite && !/^https?:\/\//i.test(finalWebsite)) {
            finalWebsite = `https://${finalWebsite}`;
        }

        post(route('onboarding.save.user'), {
            // Overriding the website value just for the request
            data: { ...data, website: finalWebsite }
        });
    };

    return (
        <>
            <Head title="Advertiser Onboarding" />

            <div
                className="min-h-screen relative flex flex-col justify-center py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')`
                }}
            >
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

                <div className="relative max-w-xl mx-auto w-full">

                    {/* Header */}
                    <div className="text-center mb-6 md:mb-8">
                        <div className="mx-auto h-14 w-14 md:h-16 md:w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-2xl">
                            <svg className="h-7 w-7 md:h-8 md:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">Setup Brand Profile</h2>
                        <p className="mt-2 text-purple-100 font-medium opacity-90 text-sm md:text-base">Tell us a bit about your company to get started.</p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/20">
                        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">

                            {/* Company Name */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 ml-1">Company Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    className={`w-full border-gray-100 bg-gray-50 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-bold text-gray-700 ${errors.company_name ? 'border-red-500' : ''}`}
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    required
                                />
                                {errors.company_name && <p className="mt-1 text-xs text-red-600 font-bold ml-1">{errors.company_name}</p>}
                            </div>

                            {/* Industry Dropdown */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 ml-1">Industry</label>
                                <div className="relative">
                                    <select
                                        className={`w-full border-gray-100 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 appearance-none bg-gray-50 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-bold text-gray-700 ${errors.industry ? 'border-red-500' : ''}`}
                                        value={data.industry}
                                        onChange={(e) => setData('industry', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="technology">Technology & Software</option>
                                        <option value="ecommerce">E-commerce & Retail</option>
                                        <option value="finance">Fintech & Finance</option>
                                        <option value="entertainment">Entertainment & Media</option>
                                        <option value="education">Education (EdTech)</option>
                                        <option value="healthcare">Healthcare & Wellness</option>
                                        <option value="others">Others</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                {errors.industry && <p className="mt-1 text-xs text-red-600 font-bold ml-1">{errors.industry}</p>}
                            </div>

                            {/* Website - Changed type to "text" for flexible input */}
                         <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 ml-1">
                                Website
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                    <span className="text-purple-400 font-bold text-sm md:text-base">
                                        https://
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    placeholder="yourbrand.com"
                                    className={`w-full border-gray-100 bg-gray-50 rounded-xl md:rounded-2xl py-3.5 md:py-4 pl-[4.5rem] md:pl-[5.2rem] pr-5 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-bold text-gray-700 ${
                                        errors.website ? 'border-red-500' : ''
                                    }`}
                                    value={data.website}
                                    onChange={(e) => {
                                        // This prevents double https:// if they paste a full URL
                                        const input = e.target.value;
                                        const cleanValue = input.replace(/^https?:\/\//i, '');
                                        setData('website', cleanValue);
                                    }}
                                />
                            </div>
                            {/* Show a helpful hint if there is an error */}
                            {errors.website ? (
                                <p className="mt-1 text-xs text-red-600 font-bold ml-1">{errors.website}</p>
                            ) : (
                                <p className="mt-1.5 text-[9px] text-gray-400 font-medium ml-1 italic">
                                    Example: gig.com (we add the https:// for you)
                                </p>
                            )}
                        </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 ml-1">Bio / Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe your brand's mission..."
                                    className="w-full border-gray-100 bg-gray-50 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-medium text-gray-700"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 md:py-5 bg-purple-600 text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-500/30 transition-all transform active:scale-[0.96] disabled:opacity-50 mt-4"
                            >
                                {processing ? 'Launching Profile...' : 'Complete Profile & Launch'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        TIDP Brand Onboarding &bull; 2026
                    </p>
                </div>
            </div>
        </>
    );
}
