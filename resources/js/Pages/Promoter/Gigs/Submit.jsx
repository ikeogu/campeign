import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const getPlatformStyle = (platform) => {
    const styles = {
        twitter: { name: 'X', icon: '𝕏', baseUrl: 'https://x.com/', classes: 'bg-blue-50 text-blue-600 border-blue-100' },
        whatsapp: { name: 'WhatsApp', icon: '💬', baseUrl: 'https://wa.me/', classes: 'bg-green-50 text-green-600 border-green-100' },
        facebook: { name: 'Facebook', icon: '👥', baseUrl: 'https://facebook.com/', classes: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        instagram: { name: 'Instagram', icon: '📸', baseUrl: 'https://instagram.com/', classes: 'bg-pink-50 text-pink-600 border-pink-100' },
        tiktok: { name: 'TikTok', icon: '🎵', baseUrl: 'https://tiktok.com/@', classes: 'bg-slate-900 text-slate-100 border-slate-700' },
        youtube: { name: 'YouTube', icon: '📺', baseUrl: 'https://youtube.com/@', classes: 'bg-red-50 text-red-600 border-red-100' },
    };
    return styles[platform?.toLowerCase()] || { name: platform, icon: '🔗', baseUrl: '', classes: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export default function SubmitPage({ gig }) {
    const { auth } = usePage().props;
    const [localError, setLocalError] = useState(null);

    const userHandles = useMemo(() => {
        try {
            const raw = gig.promoter_social_handles;
            return typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
        } catch (e) { return {}; }
    }, [gig.promoter_social_handles]);

    const platforms = useMemo(() => {
        return Array.isArray(gig.platforms) ? gig.platforms : JSON.parse(gig.platforms ?? '[]');
    }, [gig.platforms]);

    const { data, setData, post, processing, errors, transform, clearErrors } = useForm({
        submissions: platforms.map((p) => ({
            platform: p,
            link: '',
            proof: null,
        })),
    });

    const handleUpdate = (index, field, value) => {
        setLocalError(null);
        clearErrors(`submissions.${index}.${field}`);
        const newSubmissions = [...data.submissions];
        newSubmissions[index][field] = value;
        setData('submissions', newSubmissions);
    };

    const useProfileLink = (index, platform) => {
        const style = getPlatformStyle(platform);
        let handle = userHandles[platform.toLowerCase()];
        if (!handle) return;
        const cleanHandle = handle.replace('@', '');
        handleUpdate(index, 'link', `${style.baseUrl}${cleanHandle}`);
    };

    const totalExpectedPayout = useMemo(() => {
        const completedCount = data.submissions.filter(s => s.link.trim() !== '').length;
        return completedCount * Number(gig.payout);
    }, [data.submissions, gig.payout]);

    const submit = (e) => {
        e.preventDefault();
        const activeSubmissions = data.submissions.filter(s => s.link.trim() !== '');
        if (activeSubmissions.length === 0) {
            setLocalError("Please fill at least one platform.");
            return;
        }
        transform((data) => ({
            ...data,
            submissions: data.submissions.filter(s => s.link.trim() !== '')
        }));
        post(route('promoter.gigs.submit.store', gig.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Submit Proof" />

            <div className="min-h-screen bg-gray-50/50 pb-24">
                <div className="max-w-xl mx-auto px-4 pt-8 pb-12">

                    {/* Responsive Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase">Submit Proof</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1 truncate max-w-[250px]">
                                {gig.title}
                            </p>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estimated Payout</p>
                            <p className="text-xl sm:text-2xl font-black text-green-600 tracking-tighter">₦{totalExpectedPayout.toLocaleString()}</p>
                        </div>
                    </div>

                    {localError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-[11px] uppercase tracking-wide">
                            ⚠️ {localError}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6 sm:space-y-8">
                        {data.submissions.map((submission, index) => {
                            const style = getPlatformStyle(submission.platform);
                            const hasSavedHandle = !!userHandles[submission.platform.toLowerCase()];

                            return (
                                <div key={submission.platform} className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-300">

                                    {/* Platform Header Area */}
                                    <div className="flex flex-wrap justify-between items-center gap-3">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-black text-[9px] uppercase tracking-widest ${style.classes}`}>
                                            <span>{style.icon}</span>
                                            {style.name}
                                        </div>

                                        {hasSavedHandle && (
                                            <button
                                                type="button"
                                                onClick={() => useProfileLink(index, submission.platform)}
                                                className="text-[9px] font-black text-pink-600 bg-pink-50/50 px-3 py-2 rounded-xl hover:bg-pink-100 transition-colors uppercase tracking-tighter border border-pink-100 active:scale-95"
                                            >
                                                Auto-fill Profile
                                            </button>
                                        )}
                                    </div>

                                    {/* Link Input Field */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                                            Evidence Link (Post or Profile)
                                        </label>
                                        <input
                                            type="url"
                                            placeholder={`Paste your ${style.name} link here...`}
                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-base sm:text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-gray-300 placeholder:font-normal"
                                            value={submission.link}
                                            onChange={e => handleUpdate(index, 'link', e.target.value)}
                                        />
                                        {errors[`submissions.${index}.link`] && (
                                            <p className="text-red-500 text-[9px] font-black uppercase mt-1 ml-1">Invalid or duplicate link</p>
                                        )}
                                    </div>

                                    {/* Screenshot/Media Upload */}
                                    <div className="space-y-2">
                                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                                            <span>Media Proof</span>
                                            <span className="text-[8px] opacity-60">Optional</span>
                                        </label>
                                        <div className="relative border-2 border-dashed border-gray-100 rounded-2xl p-5 text-center hover:border-pink-200 transition-colors group bg-gray-50/30">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={e => handleUpdate(index, 'proof', e.target.files[0])}
                                            />
                                            <div className="flex items-center justify-center gap-3 pointer-events-none">
                                                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[150px]">
                                                    {submission.proof ? submission.proof.name : 'Tap to upload screenshot'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Submit Action Area */}
                        <div className="pt-6 sticky bottom-4 z-20">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-pink-600 shadow-2xl shadow-gray-300 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
                            >
                                {processing ? 'Uploading Data...' : 'Submit All Proofs'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
