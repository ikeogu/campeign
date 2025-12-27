import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create({ auth }) {
    // Local state for browser image previews
    const [previews, setPreviews] = useState([]);

    const { data, setData, post, errors, processing } = useForm({
        title: '',
        description: '',
        platforms: [],
        min_followers: '',
        payout: '',
        target_shares: '',
        base_budget: 0,      // Pure payout cost
        management_fee: 0,   // 3% platform fee
        total_budget: 0,     // Grand Total
        files: [],           // Key consistently named 'files'
    });

    const followerRanges = [
        { label: '100', value: '100' },
        { label: '1k', value: '1000' },
        { label: '5k', value: '5000' },
        { label: '10k', value: '10000' },
        { label: '50k', value: '50000' },
        { label: '100k+', value: '100000' },
    ];

    // --- AUTOMATIC BUDGET CALCULATIONS ---
    useEffect(() => {
        const payout = Number(data.payout) || 0;
        const shares = Number(data.target_shares) || 0;

        const baseCost = payout * shares;
        const fee = baseCost * 0.03;
        const total = baseCost + fee;

        setData((prevData) => ({
            ...prevData,
            base_budget: baseCost,
            management_fee: fee,
            total_budget: total
        }));
    }, [data.payout, data.target_shares]);

    // --- IMAGE HANDLING LOGIC ---
    function handleImages(e) {
        const newlySelectedFiles = Array.from(e.target.files);

        // Fix: Use data.files to match useForm key
        setData('files', [...data.files, ...newlySelectedFiles]);

        // Generate temporary preview URLs
        const newPreviewUrls = newlySelectedFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviewUrls]);
    }

    function removeImage(index) {
        // Remove from form data
        const updatedFiles = data.files.filter((_, i) => i !== index);
        setData('files', updatedFiles);

        // Remove from UI previews
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
    }

    function submit(e) {
        e.preventDefault();
        post(route('campaigns.store'), {
            forceFormData: true,
            onSuccess: () => alert('Campaign Launched!'),
        });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Create Campaign"
        >
            <Head title="Create Campaign" />

            <div className="max-w-4xl mx-auto pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link href={route('campaigns.index')} className="text-pink-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Cancel & Return
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Launch <span className="text-pink-600">Gig</span></h1>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-pink-50 shadow-sm space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. New Product Launch 2024"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-pink-500 font-bold text-gray-700 placeholder:text-gray-300 transition-all"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="mt-2 text-xs text-pink-600 font-bold">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Instructions for Promoters</label>
                                <textarea
                                    rows="4"
                                    placeholder="Tell promoters what to write and where to post..."
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-pink-500 font-medium text-gray-700 transition-all"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Targeting Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-pink-50 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6">Targeting & Reach</h3>

                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mb-4">Select Platforms</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Facebook', 'YouTube', 'Instagram', 'WhatsApp', 'TikTok', 'Twitter'].map((p) => {
                                            const id = p.toLowerCase();
                                            const isChecked = data.platforms.includes(id);
                                            return (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = [...data.platforms];
                                                        setData('platforms', isChecked ? current.filter(x => x !== id) : [...current, id]);
                                                    }}
                                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isChecked ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'}`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mb-4">Minimum Follower Requirement</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {followerRanges.map((range) => (
                                            <button
                                                key={range.value}
                                                type="button"
                                                onClick={() => setData('min_followers', range.value)}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${data.min_followers === range.value ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-400 hover:bg-pink-50'}`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visuals Card */}
                        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-dashed border-pink-100">
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 text-center">Campaign Creative Assets</label>
                            <input
                                type="file"
                                multiple
                                onChange={handleImages}
                                className="block w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gray-900 file:text-white file:text-[10px] file:font-black file:uppercase cursor-pointer"
                            />

                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <img src={src} className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Budget & Submit */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8">
                            <h3 className="text-xs font-black text-pink-500 uppercase tracking-[0.2em] mb-8">Budget Summary</h3>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Payout Per Share (₦)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-xl font-black text-white focus:ring-pink-500"
                                            value={data.payout}
                                            onChange={(e) => setData('payout', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Target Share Count</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-xl font-black text-white focus:ring-pink-500"
                                            value={data.target_shares}
                                            onChange={(e) => setData('target_shares', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 space-y-3">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-400">Net Spend</span>
                                        <span>₦{data.base_budget.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-400">Platform Fee (3%)</span>
                                        <span className="text-pink-500">+₦{data.management_fee.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Budget</p>
                                    <p className="text-4xl font-black text-green-400 tracking-tighter">₦{data.total_budget.toLocaleString()}</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-pink-600 hover:bg-pink-700 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all transform active:scale-95 disabled:opacity-50 shadow-xl shadow-pink-900/20"
                                >
                                    {processing ? 'Processing...' : 'Launch Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
