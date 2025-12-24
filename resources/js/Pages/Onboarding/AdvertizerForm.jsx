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
        post(route('onboarding.save.user'));
    };

    return (
        <>
            <Head title="Advertiser Onboarding" />

            {/* --- BACKGROUND WRAPPER --- */}
            <div
                className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
                style={{
                    // High-quality abstract corporate background
                    backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')`
                }}
            >
                {/* Overlay to ensure readability and purple tint */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

                <div className="relative max-w-xl mx-auto w-full">

                    {/* Header with Glass Effect */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-2xl">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Setup Brand Profile</h2>
                        <p className="mt-2 text-purple-100 font-medium opacity-90">Tell us a bit about your company to get started.</p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/20">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Company Name */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    className={`w-full border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-bold text-gray-700 ${errors.company_name ? 'border-red-500' : ''}`}
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    required
                                />
                                {errors.company_name && <p className="mt-1 text-xs text-red-600 font-bold ml-1">{errors.company_name}</p>}
                            </div>

                            {/* Industry Dropdown */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Industry</label>
                                <div className="relative">
                                    <select
                                        className={`w-full border-gray-100 rounded-2xl px-5 py-4 appearance-none bg-gray-50 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-bold text-gray-700 ${errors.industry ? 'border-red-500' : ''}`}
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

                            {/* Website */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Website (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://yoursite.com"
                                    className="w-full border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-bold text-gray-700"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bio / Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe your brand's mission..."
                                    className="w-full border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 focus:bg-white transition-all outline-none font-medium text-gray-700"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-5 bg-purple-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-purple-700 shadow-2xl shadow-purple-500/40 transition-all transform active:scale-[0.96] disabled:opacity-50 mt-4"
                            >
                                {processing ? 'Launching Profile...' : 'Complete Profile & Launch'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-white/60 text-xs font-bold uppercase tracking-widest">
                        TIDP Brand Onboarding &bull; 2025
                    </p>
                </div>
            </div>
        </>
    );
}
