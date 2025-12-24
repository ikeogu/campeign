import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ auth }) {
    const { campaign } = usePage().props;

    // Existing media from the backend
    const existingImages = campaign.image_urls || [];
    const [newPreviews, setNewPreviews] = useState([]);

    const { data, setData, post, errors, processing } = useForm({
        _method: 'POST', // Required for Laravel to handle files via a PUT/PATCH spoof
        title: campaign.title || '',
        description: campaign.description || '',
        platforms: campaign.platforms || [],
        min_followers: campaign.min_followers || '',
        payout: campaign.payout || '',
        target_shares: campaign.target_shares || '',
        base_budget: campaign.base_budget || 0,
        management_fee: campaign.management_fee || 0,
        total_budget: campaign.total_budget || 0,
        status: campaign.status || 'pending',
        new_files: [],     // consistently named 'files' logic
        remove_files: [],  // IDs of existing media to delete
    });

    const followerRanges = [
        { label: '100 - 1k', value: '100-1000' },
        { label: '1k - 5k', value: '1000-5000' },
        { label: '5k - 10k', value: '5000-10000' },
        { label: '10k - 50k', value: '10000-50000' },
        { label: '50k - 100k', value: '50000-100000' },
        { label: '100k+', value: '100000+' },
    ];

    // SYNC BUDGET CALCULATION
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
        // Fix: Use data.new_files to match useForm key
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
        // Laravel requires POST with _method spoofing for multipart data updates
        post(route('campaigns.update', campaign.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout user={auth.user} header="Edit Campaign">
            <Head title={`Editing: ${campaign.title}`} />

            <div className="max-w-4xl mx-auto pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link href={route('campaigns.index')} className="text-pink-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Discard Changes
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Update <span className="text-pink-600">Campaign</span></h1>
                    </div>
                    {/* Status Badge */}
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm self-start md:self-center">
                        <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Status:</span>
                        <span className="text-xs font-black uppercase text-pink-600">{data.status}</span>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Global Errors */}
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem]">
                                <p className="text-rose-600 font-black text-xs uppercase tracking-widest mb-2">Update failed. Please check:</p>
                                <ul className="space-y-1">
                                    {Object.values(errors).map((err, i) => (
                                        <li key={i} className="text-rose-500 text-sm font-medium">• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-pink-50 shadow-sm space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-pink-500 font-bold text-gray-700 transition-all"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
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

                        {/* Targeting */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-pink-50 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6">Audience Requirements</h3>
                            <div className="space-y-8">
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
                            </div>
                        </div>

                        {/* Media Management */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2.5rem] border border-pink-50 shadow-sm">
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Active Assets (Click to Delete)</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {existingImages.map((img) => {
                                        const isMarked = data.remove_files.includes(img.id);
                                        return (
                                            <div key={img.id} className="relative aspect-square group cursor-pointer" onClick={() => toggleRemoveFile(img.id)}>
                                                <img src={img.url} className={`w-full h-full object-cover rounded-2xl transition-all duration-300 ${isMarked ? 'opacity-20 grayscale scale-90' : 'opacity-100'}`} />
                                                <div className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-all ${isMarked ? 'bg-rose-500/20' : 'bg-transparent group-hover:bg-black/20'}`}>
                                                    {isMarked && <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">Removing</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-dashed border-pink-100">
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Add New Assets</label>
                                <input type="file" multiple onChange={handleNewFiles} className="block w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gray-900 file:text-white file:text-[10px] file:font-black file:uppercase cursor-pointer" />

                                {newPreviews.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
                                        {newPreviews.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square">
                                                <img src={file.url} className="w-full h-full object-cover rounded-2xl border-2 border-white shadow-sm" />
                                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">New</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Budget & Submit */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8">
                            <h3 className="text-xs font-black text-pink-500 uppercase tracking-[0.2em] mb-8">Budget Adjustments</h3>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Payout (₦)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-xl font-black text-white focus:ring-pink-500"
                                            value={data.payout}
                                            onChange={(e) => setData('payout', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Shares</label>
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
                                        <span className="text-gray-400">Fee (3%)</span>
                                        <span className="text-pink-500">+₦{data.management_fee.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Final Budget</p>
                                    <p className="text-4xl font-black text-green-400 tracking-tighter">₦{data.total_budget.toLocaleString()}</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-green-600 hover:bg-green-700 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
