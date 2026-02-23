import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const getPlatformStyle = (platform) => {
    const styles = {
        twitter: { name: 'X / Twitter', icon: '𝕏', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
        whatsapp: { name: 'WhatsApp', icon: '💬', classes: 'bg-green-50 text-green-600 border-green-200' },
        facebook: { name: 'Facebook', icon: '👥', classes: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        instagram: { name: 'Instagram', icon: '📸', classes: 'bg-pink-50 text-pink-600 border-pink-200' },
        tiktok: { name: 'TikTok', icon: '🎵', classes: 'bg-slate-900 text-slate-100 border-slate-700' },
        youtube: { name: 'YouTube', icon: '📺', classes: 'bg-red-50 text-red-600 border-red-200' },
    };
    return styles[platform?.toLowerCase()] || { name: platform, icon: '🔗', classes: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export default function SubmitPage({ gig }) {
    const { auth } = usePage().props;
    const [localError, setLocalError] = useState(null);

    const platforms = useMemo(() => {
        return Array.isArray(gig.platforms) ? gig.platforms : JSON.parse(gig.platforms ?? '[]');
    }, [gig.platforms]);

    const { data, setData, post, processing, errors, transform, clearErrors } = useForm({
        // This matches your backend: submissions.*
        submissions: platforms.map((p) => ({
            platform: p,
            link: '',
            proof: null,
        })),
    });

    const handleUpdate = (index, field, value) => {
        setLocalError(null);
        // Clear specific index errors
        clearErrors(`submissions.${index}.${field}`);

        const newSubmissions = [...data.submissions];
        newSubmissions[index][field] = value;
        setData('submissions', newSubmissions);
    };

    const totalExpectedPayout = useMemo(() => {
        // Count how many platforms have a link
        const completedCount = data.submissions.filter(s => s.link.trim() !== '').length;
        return completedCount * Number(gig.payout);
    }, [data.submissions, gig.payout]);

    const submit = (e) => {
        e.preventDefault();

        const activeSubmissions = data.submissions.filter(s => s.link.trim() !== '');

        if (activeSubmissions.length === 0) {
            setLocalError("Please provide a link for at least one platform.");
            return;
        }

        // Clean data before sending: only send rows that have a link
        transform((data) => ({
            ...data,
            submissions: data.submissions.filter(s => s.link.trim() !== '')
        }));

        post(route('promoter.gigs.submit.store', gig.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Submit Proof" />

            <div className="max-w-2xl mx-auto py-12 px-4">

                {/* Header Section */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Submit Proof</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Gig: {gig.title}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Potential Payout</p>
                        <p className="text-3xl font-black text-green-600">₦{totalExpectedPayout.toLocaleString()}</p>
                    </div>
                </div>

                {localError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-xs">
                        ⚠️ {localError}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    {data.submissions.map((submission, index) => {
                        const style = getPlatformStyle(submission.platform);
                        return (
                            <div key={submission.platform} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
                                {/* Platform Badge */}
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-black text-[10px] uppercase tracking-widest ${style.classes}`}>
                                    <span>{style.icon}</span>
                                    {style.name}
                                </div>

                                {/* Link Input */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                        Post or Profile Link
                                    </label>
                                    <input
                                        type="url"
                                        placeholder={`https://${submission.platform.toLowerCase()}.com/...`}
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-pink-500 transition-all"
                                        value={submission.link}
                                        onChange={e => handleUpdate(index, 'link', e.target.value)}
                                    />
                                    {errors[`submissions.${index}.link`] && (
                                        <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">This link is already used or invalid</p>
                                    )}
                                </div>

                                {/* Screenshot Proof (Optional) */}
                                <div>
                                    <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                        <span>Screenshot (Optional)</span>
                                        <span className="text-gray-300 italic">JPG/PNG/MP4</span>
                                    </label>
                                    <div className="relative border-2 border-dashed border-gray-100 rounded-3xl p-6 text-center hover:border-pink-200 transition-colors group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => handleUpdate(index, 'proof', e.target.files[0])}
                                        />
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-pink-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                {submission.proof ? submission.proof.name : 'Upload media proof'}
                                            </p>
                                        </div>
                                    </div>
                                    {errors[`submissions.${index}.proof`] && (
                                        <p className="text-red-500 text-[10px] mt-2 font-bold italic">{errors[`submissions.${index}.proof`]}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Final Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-6 bg-gray-900 text-white font-black rounded-[2rem] hover:bg-pink-600 shadow-2xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.3em]"
                        >
                            {processing ? 'Processing Submission...' : 'Finish & Submit All Proofs'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
