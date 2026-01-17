import { Head, useForm } from '@inertiajs/react';

export default function PromoterOnboard() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        social_handles: {},
        follower_count: '',
        platforms: [],
        user_type: 'promoter',
    });

    // Updated with X logo (SVG) and modern styling
    const PLATFORMS = [
        {
            key: 'x',
            label: 'X',
            color: 'bg-black',
            icon: (
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
            )
        },
        { key: 'facebook', label: 'Facebook', color: 'bg-[#1877F2]', icon: '📘' },
        { key: 'instagram', label: 'Instagram', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', icon: '📸' },
        { key: 'linkedin', label: 'LinkedIn', color: 'bg-[#0077b5]', icon: '💼' }
    ];

    const handlePlatformToggle = (platformKey) => {
        const currentHandles = { ...data.social_handles };
        let currentPlatforms = [...data.platforms];

        if (currentHandles[platformKey] !== undefined) {
            delete currentHandles[platformKey];
            currentPlatforms = currentPlatforms.filter((p) => p !== platformKey);
        } else {
            currentHandles[platformKey] = '';
            currentPlatforms.push(platformKey);
        }

        setData({
            ...data,
            social_handles: currentHandles,
            platforms: currentPlatforms,
        });
    };

    const handleHandleChange = (platformKey, value) => {
        setData('social_handles', { ...data.social_handles, [platformKey]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const filteredSocialHandles = Object.fromEntries(
            Object.entries(data.social_handles).filter(([key, value]) => value.trim() !== '')
        );
        const selectedPlatforms = Object.keys(filteredSocialHandles);

        post(route('onboarding.save.user'), {
            data: {
                ...data,
                social_handles: filteredSocialHandles,
                platforms: selectedPlatforms,
            }
        });
    };

    const selectedPlatformsKeys = Object.keys(data.social_handles);

    return (
        <>
            <Head title="Promoter Onboarding" />

            <div
                className="min-h-screen relative flex items-center justify-center py-6 md:py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-fixed bg-center"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1622566694128-5737e2356bb3?q=80&w=2000&auto=format&fit=crop')`
                }}
            >
                <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-[3px]"></div>

                <div className="relative max-w-2xl mx-auto w-full">

                    {/* Header Section */}
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                            Join the <span className="text-indigo-400">Elite</span>
                        </h1>
                        <p className="text-indigo-100 font-bold text-xs md:text-sm uppercase tracking-[0.2em] mt-2 px-4">
                            Verify your influence to start earning
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
                        <form onSubmit={handleSubmit} className="p-6 sm:p-12 space-y-6 md:space-y-8">

                            {/* Personal Info Grid - Responsive column toggle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl py-3 md:py-4 px-6 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-700"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        required
                                    />
                                    {errors.first_name && <p className="mt-2 text-xs text-red-600 font-bold ml-1">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl py-3 md:py-4 px-6 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-700"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        required
                                    />
                                    {errors.last_name && <p className="mt-2 text-xs text-red-600 font-bold ml-1">{errors.last_name}</p>}
                                </div>
                            </div>

                            {/* Platform Selection - Responsive 2-column on mobile */}
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 text-center md:text-left">Choose Your Platforms</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {PLATFORMS.map((platform) => {
                                        const isSelected = data.social_handles.hasOwnProperty(platform.key);
                                        return (
                                            <button
                                                key={platform.key}
                                                type="button"
                                                onClick={() => handlePlatformToggle(platform.key)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 active:scale-90 ${
                                                    isSelected
                                                    ? 'border-indigo-600 bg-indigo-50 shadow-inner'
                                                    : 'border-gray-50 bg-white hover:border-indigo-100'
                                                }`}
                                            >
                                                <div className={`${platform.color} w-10 h-10 flex items-center justify-center rounded-xl text-xl shadow-lg mb-2`}>
                                                    {platform.icon}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                    {platform.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dynamic Social Handle Inputs */}
                            {selectedPlatformsKeys.length > 0 && (
                                <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Social Handles</h3>
                                    {selectedPlatformsKeys.map((key) => {
                                        const platform = PLATFORMS.find(p => p.key === key);
                                        return (
                                            <div key={key} className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                    {platform?.icon}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={`${platform?.label} @username`}
                                                    className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-6 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-700 text-sm"
                                                    value={data.social_handles[key]}
                                                    onChange={(e) => handleHandleChange(key, e.target.value)}
                                                    required
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Follower Count */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 ml-1">Aggregate Reach (Total Followers)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">📈</span>
                                    <input
                                        type="number"
                                        placeholder="e.g. 25000"
                                        className="w-full bg-indigo-50/50 border-none rounded-xl md:rounded-2xl py-4 md:py-5 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black text-xl md:text-2xl text-indigo-600 placeholder:text-indigo-200"
                                        value={data.follower_count}
                                        onChange={(e) => setData('follower_count', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 md:py-5 rounded-xl md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-indigo-500/30 transition-all transform active:scale-[0.97] disabled:opacity-50 text-xs md:text-sm uppercase tracking-widest"
                            >
                                {processing ? 'Verifying...' : 'Complete My Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
