import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

export default function Edit({ auth }) {
    const { campaign } = usePage().props;

    const existingImages = campaign.media || []; // Adjust based on your media relation
    const [newPreviews, setNewPreviews] = useState([]);

    const { data, setData, post, errors, processing } = useForm({
        _method: 'POST',
        title: campaign.title || '',
        description: campaign.description || '',
        category: campaign.category || '',
        platforms: campaign.platforms || [],
        min_followers: campaign.min_followers || '',
        payout: campaign.payout || '',
        target_shares: campaign.target_shares || '',
        base_budget: campaign.base_budget || 0,
        management_fee: campaign.management_fee || 0,
        total_budget: campaign.total_budget || 0,
        status: campaign.status || 'pending',
        new_files: [],
        remove_files: [],
    });

    const categories = [
        'Fashion & Beauty', 'Technology & Gadgets', 'Software & Apps', 'Finance & Investments',
        'Food & Beverages', 'Health & Wellness', 'Education & Learning', 'Real Estate & Housing',
        'Household & Living', 'Entertainment & Media', 'Sports & Gaming', 'Transportation & Mobility',
        'Retail & E-commerce', 'Politics & Governance', 'NGOs & Social Impact', 'Jobs, Careers & Gigs',
        'Events & Experiences', 'Religion & Faith-Based', 'Agriculture & Agribusiness'
    ];

    const followerRanges = [
        { label: '100', value: '100' },
        { label: '1k', value: '1000' },
        { label: '5k', value: '5000' },
        { label: '10k', value: '10000' },
        { label: '50k', value: '50000' },
        { label: '100k+', value: '100000' },
    ];

    useEffect(() => {
        const payout = Number(data.payout) || 0;
        const shares = Number(data.target_shares) || 0;
        const baseCost = payout * shares;
        const fee = baseCost * 0.03;
        const total = baseCost + fee;

        setData((prev) => ({
            ...prev,
            base_budget: baseCost,
            management_fee: fee,
            total_budget: total
        }));
    }, [data.payout, data.target_shares]);

    function handleNewFiles(e) {
        const files = Array.from(e.target.files);
        setData('new_files', [...data.new_files, ...files]);

        const previews = files.map((file) => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
        }));
        setNewPreviews((prev) => [...prev, ...previews]);
    }

    function submit(e) {
        e.preventDefault();
        post(route('campaigns.update', campaign.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editing: ${campaign.title}`} />

            <div className="max-w-6xl mx-auto pb-32 pt-8 px-4">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link href={route('campaigns.index')} className="text-pink-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2 group">
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Discard Changes
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Update <span className="text-pink-600">Gig</span></h1>
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm self-start inline-flex items-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Status:</span>
                        <span className="text-xs font-black uppercase text-pink-600">{data.status}</span>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Main Form Content */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Basic Info */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Campaign Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-pink-500 font-bold text-gray-700 transition-all"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-pink-600 tracking-widest mb-4">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setData('category', cat)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                                data.category === cat
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                                : 'bg-white border-gray-50 text-gray-400 hover:border-pink-100'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Targeting */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mb-4">Social Platforms</p>
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
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isChecked ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-50 text-gray-400'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mb-4">Follower Requirement</p>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {followerRanges.map((range) => (
                                        <button
                                            key={range.value}
                                            type="button"
                                            onClick={() => setData('min_followers', range.value)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${data.min_followers === range.value ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-50 text-gray-400'}`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Budget & Responsive Submit Button */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl sticky top-8">
                            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 border-b border-gray-800 pb-4">
                                Budget Breakdown
                            </h3>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Payout / Share</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border-none rounded-xl py-3 px-4 text-white font-bold"
                                        value={data.payout}
                                        onChange={e => setData('payout', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Target Shares</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border-none rounded-xl py-3 px-4 text-white font-bold"
                                        value={data.target_shares}
                                        onChange={e => setData('target_shares', e.target.value)}
                                    />
                                </div>

                                <div className="pt-4 space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-gray-400">
                                        <span>Base Budget</span>
                                        <span>{formatCurrency(data.base_budget)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-400">
                                        <span>Management Fee (3%)</span>
                                        <span>{formatCurrency(data.management_fee)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-black text-white pt-4 border-t border-gray-800">
                                        <span>Total Cost</span>
                                        <span className="text-pink-500">{formatCurrency(data.total_budget)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Submit Button (Hidden on Mobile) */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="hidden md:block w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-pink-900/20 uppercase tracking-widest text-sm"
                            >
                                {processing ? 'Updating...' : 'Update Gig Now'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* STICKY MOBILE SUBMIT BUTTON (Visible only on Mobile) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
                    <button
                        onClick={submit}
                        disabled={processing}
                        className="w-full bg-pink-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 uppercase tracking-widest text-sm active:scale-95 transition-transform"
                    >
                        {processing ? 'Saving Changes...' : 'Update Gig'}
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
