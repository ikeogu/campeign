import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ auth }) {
    const { campaign } = usePage().props;

    const existingImages = campaign.image_urls || [];
    const [newPreviews, setNewPreviews] = useState([]);

    const { data, setData, post, errors, processing } = useForm({
        _method: 'POST',
        title: campaign.title || '',
        description: campaign.description || '',
        category: campaign.category || '', // Hydrated from existing campaign
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
         'Fashion & Beauty',
        'Technology & Gadgets',
        'Software & Apps',
        'Finance & Investments',
        'Food & Beverages',
        'Health & Wellness',
        'Education & Learning',
        'Real Estate & Housing',
        'Household & Living',
        'Entertainment & Media',
        'Sports & Gaming',
        'Transportation & Mobility',
        'Retail & E-commerce',
        'Politics & Governance',
        'NGOs & Social Impact',
        'Jobs, Careers & Gigs',
        'Events & Experiences',
        'Religion & Faith-Based',
        'Agriculture & Agribusiness'
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

    function toggleRemoveFile(fileId) {
        const isMarked = data.remove_files.includes(fileId);
        if (isMarked) {
            setData('remove_files', data.remove_files.filter((id) => id !== fileId));
        } else {
            setData('remove_files', [...data.remove_files, fileId]);
        }
    }

    function submit(e) {
        e.preventDefault();
        post(route('campaigns.update', campaign.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout user={auth.user} header="Edit Campaign">
            <Head title={`Editing: ${campaign.title}`} />

            <div className="max-w-4xl mx-auto pb-20 px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link href={route('campaigns.index')} className="text-pink-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Discard Changes
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Update <span className="text-pink-600">Gig</span></h1>
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm self-start md:self-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Status:</span>
                        <span className="text-xs font-black uppercase text-pink-600">{data.status}</span>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info & Category Selection */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-pink-50 shadow-sm space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-pink-500 font-bold text-gray-700 transition-all"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                            </div>

                            {/* CATEGORY SELECTION IN EDIT */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-pink-600 tracking-widest mb-4">Update Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setData('category', cat)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                                data.category === cat
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Instructions</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-pink-500 font-medium text-gray-700 transition-all"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Targeting & Audience */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-pink-50 shadow-sm space-y-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Audience Requirements</h3>

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
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isChecked ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}
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

                        {/* Media Management Section remains same... */}
                        {/* (Include the existing active assets and add new assets code here) */}
                    </div>

                    {/* Budget Summary Column remains same... */}
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
