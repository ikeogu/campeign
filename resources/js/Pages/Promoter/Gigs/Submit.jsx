import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const getPlatformStyle = (platform) => {
    const styles = {
        twitter: { name: 'X / Twitter', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
        instagram: { name: 'Instagram', classes: 'bg-pink-50 text-pink-600 border-pink-200' },
        tiktok: { name: 'TikTok', classes: 'bg-slate-900 text-slate-100 border-slate-700' },
    };
    return styles[platform?.toLowerCase()] || { name: platform, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export default function SubmitPage({ gig }) {
    const { auth } = usePage().props;
    const platforms = gig?.platforms || [];
    const [previews, setPreviews] = useState({});

    const { data, setData, post, processing, errors, transform } = useForm({
        submissions: platforms.map((p) => ({
            platform: p,
            link: '',
            proof: null,
        })),
    });

    const readySubmissions = useMemo(() => {
        return data.submissions.filter(s => s.link.trim() !== '' && s.proof !== null);
    }, [data.submissions]);

    const totalExpectedPayout = readySubmissions.length * Number(gig.payout);

    const handleUpdate = (index, field, value) => {
        const newSubmissions = [...data.submissions];
        newSubmissions[index][field] = value;
        setData('submissions', newSubmissions);
    };

    const handleFileChange = (index, platform, file) => {
        if (!file) return;
        handleUpdate(index, 'proof', file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => ({ ...prev, [platform]: reader.result }));
        reader.readAsDataURL(file);
    };

    const submit = (e) => {
        e.preventDefault();
        if (readySubmissions.length === 0) return alert("Complete at least one platform.");

        transform((data) => ({
            ...data,
            submissions: readySubmissions
        }));

        post(route('promoter.gigs.submit.store', gig.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-gradient-to-br from-green-50 to-white border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Submit Proof</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Gig: {gig.title}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Expected Earnings</p>
                            <p className="text-3xl font-black text-green-600">₦{totalExpectedPayout.toLocaleString()}</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-8">
                        {data.submissions.map((item, index) => {
                            const style = getPlatformStyle(item.platform);
                            const isReady = item.link.trim() !== '' && item.proof !== null;
                            return (
                                <div key={item.platform} className={`p-6 rounded-[2rem] border-2 transition-all ${isReady ? 'border-green-200 bg-green-50/30' : 'border-gray-50 bg-gray-50/50'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${style.classes}`}>
                                            {style.name}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <input 
                                                type="url" 
                                                placeholder="Paste Link Here" 
                                                className="w-full rounded-xl border-gray-200 text-sm font-bold"
                                                value={item.link}
                                                onChange={(e) => handleUpdate(index, 'link', e.target.value)}
                                            />
                                            <input 
                                                type="file" 
                                                id={`file-${index}`} 
                                                className="hidden" 
                                                onChange={(e) => handleFileChange(index, item.platform, e.target.files[0])}
                                            />
                                            <label htmlFor={`file-${index}`} className="block text-center py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer text-xs font-black text-gray-400 uppercase hover:border-green-400 hover:text-green-600 transition-all">
                                                {item.proof ? '✓ Proof Attached' : 'Upload Screenshot'}
                                            </label>
                                        </div>
                                        <div className="h-32 bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                            {previews[item.platform] ? <img src={previews[item.platform]} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-300 font-bold uppercase">No Preview</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <button disabled={processing} className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all uppercase tracking-widest text-sm">
                            {processing ? 'Uploading Proofs...' : 'Complete My Payout'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}