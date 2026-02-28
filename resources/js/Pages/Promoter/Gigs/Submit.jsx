import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const getPlatformStyle = (platform) => {
    const p = platform?.toLowerCase() || '';
    const styles = {
        'twitter': { name: 'X', icon: '𝕏', baseUrl: 'https://x.com/', classes: 'bg-blue-50 text-blue-600 border-blue-100' },
        'x (twitter)': { name: 'X', icon: '𝕏', baseUrl: 'https://x.com/', classes: 'bg-blue-50 text-blue-600 border-blue-100' },
        'whatsapp': { name: 'WhatsApp', icon: '💬', baseUrl: 'https://wa.me/', classes: 'bg-green-50 text-green-600 border-green-100' },
        'facebook': { name: 'Facebook', icon: '👥', baseUrl: 'https://facebook.com/', classes: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        'instagram': { name: 'Instagram', icon: '📸', baseUrl: 'https://instagram.com/', classes: 'bg-pink-50 text-pink-600 border-pink-100' },
        'tiktok': { name: 'TikTok', icon: '🎵', baseUrl: 'https://tiktok.com/@', classes: 'bg-slate-900 text-slate-100 border-slate-700' },
        'youtube': { name: 'YouTube', icon: '📺', baseUrl: 'https://youtube.com/@', classes: 'bg-red-50 text-red-600 border-red-100' },
        'threads': { name: 'Threads', icon: '🧵', baseUrl: 'https://threads.net/@', classes: 'bg-gray-50 text-gray-900 border-gray-200' },
        'snapchat': { name: 'Snapchat', icon: '👻', baseUrl: 'https://snapchat.com/add/', classes: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    };
    return styles[p] || { name: platform, icon: '🔗', baseUrl: '', classes: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export default function SubmitPage({ gig }) {
    const { auth } = usePage().props;
    const [localError, setLocalError] = useState(null);

    const getUnifiedKey = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('twitter') || p === 'x') return 'twitter';
        return p;
    };
    // FIXED: Unified handle lookup
    const userHandles = useMemo(() => {
        try {
            const raw = gig.promoter_social_handles;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!Array.isArray(parsed)) return {};

            return parsed.reduce((acc, item) => {
                if (!item?.platform || !item?.handle) return acc;
                // Use the unified key (e.g., 'x' becomes 'twitter')
                const key = getUnifiedKey(item.platform);
                acc[key] = item.handle;
                return acc;
            }, {});
        } catch { return {}; }
    }, [gig.promoter_social_handles]);

    const platforms = useMemo(() => {
        return Array.isArray(gig.platforms) ? gig.platforms : JSON.parse(gig.platforms ?? '[]');
    }, [gig.platforms]);

    const { data, setData, post, processing, errors, transform, clearErrors } = useForm({
        submissions: platforms.map((p) => ({ platform: p, link: '', proof: null })),
    });

    const handleUpdate = (index, field, value) => {
        setLocalError(null);
        clearErrors(`submissions.${index}.${field}`);
        const newSubmissions = [...data.submissions];
        newSubmissions[index][field] = value;
        setData('submissions', newSubmissions);
    };

    // ACTION: Paste from Clipboard
    const handlePaste = async (index) => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) handleUpdate(index, 'link', text);
        } catch (err) {
            setLocalError("Clipboard access denied. Please paste manually.");
        }
    };

    const useProfileLink = (index, platform) => {
        const style = getPlatformStyle(platform);
        // Use the unified key to find the handle
        const handle = userHandles[getUnifiedKey(platform)];

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
                <div className="max-w-xl mx-auto px-4 pt-8">
                    {/* Header Area */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Submit Proof</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{gig.title}</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-right">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Payout</p>
                            <p className="text-lg font-black text-green-600">₦{totalExpectedPayout.toLocaleString()}</p>
                        </div>
                    </div>

                    {localError && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl font-bold text-[10px] uppercase">⚠️ {localError}</div>}

                    <form onSubmit={submit} className="space-y-6">
                        {data.submissions.map((submission, index) => {
                            const style = getPlatformStyle(submission.platform);
                            const hasSavedHandle = !!userHandles[submission.platform.toLowerCase()];

                            return (
                                <div key={submission.platform} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-black text-[9px] uppercase tracking-widest ${style.classes}`}>
                                            <span>{style.icon}</span> {style.name}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {/* PASTE BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => handlePaste(index)}
                                                className="text-[9px] font-black text-gray-500 bg-gray-100 px-3 py-2 rounded-xl hover:bg-gray-200 transition-all uppercase active:scale-95"
                                            >
                                                📋 Paste
                                            </button>

                                            {/* 2. INSERT HANDLE: Just the @username */}
                                             { /*   {hasSavedHandle && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const handle = userHandles[submission.platform.toLowerCase()];
                                                            handleUpdate(index, 'link', handle.startsWith('@') ? handle : `@${handle}`);
                                                        }}
                                                        className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all uppercase active:scale-95 flex items-center gap-1"
                                                    >
                                                        🏷️ Handle
                                                    </button>
                                                )} */}

                                            {/* AUTOFILL BUTTON */}
                                            {hasSavedHandle && (
                                                <button
                                                    type="button"
                                                    onClick={() => useProfileLink(index, submission.platform)}
                                                    className="text-[9px] font-black text-pink-600 bg-pink-50 px-3 py-2 rounded-xl hover:bg-pink-100 transition-all uppercase active:scale-95"
                                                >
                                                    ✨ Profile
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            type="url"
                                            placeholder={`Paste ${style.name} link...`}
                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                            value={submission.link}
                                            onChange={e => handleUpdate(index, 'link', e.target.value)}
                                        />
                                    </div>

                                    {/* Media Upload */}
                                    <div className="relative border-2 border-dashed border-gray-100 rounded-2xl p-4 text-center hover:border-pink-200 transition-colors bg-gray-50/30">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => handleUpdate(index, 'proof', e.target.files[0])} />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">
                                            {submission.proof ? `✅ ${submission.proof.name}` : '📸 Upload Screenshot (Optional)'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-pink-600 transition-all active:scale-95 uppercase text-xs tracking-widest shadow-xl shadow-gray-200"
                        >
                            {processing ? 'Processing...' : 'Complete Submission'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
