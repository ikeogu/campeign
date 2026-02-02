import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Head } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

const getPlatformStyle = (platform) => {
    const styles = {
        twitter: { name: 'X / Twitter', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
        whatsapp: { name: 'WhatsApp', classes: 'bg-green-50 text-green-600 border-green-200' },
        facebook: { name: 'Facebook', classes: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        instagram: { name: 'Instagram', classes: 'bg-pink-50 text-pink-600 border-pink-200' },
        tiktok: { name: 'TikTok', classes: 'bg-slate-900 text-slate-100 border-slate-700' },
        youtube: { name: 'YouTube', classes: 'bg-red-50 text-red-600 border-red-200' },
    };
    return styles[platform?.toLowerCase()] || { name: platform, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export default function SubmitPage({ gig }) {
    const { auth } = usePage().props;
    const [localError, setLocalError] = useState(null);

    const platforms = useMemo(() => {
        return Array.isArray(gig.platforms) ? gig.platforms : JSON.parse(gig.platforms ?? '[]');
    }, [gig.platforms]);

    const [previews, setPreviews] = useState({});

    const { data, setData, post, processing, errors, transform, clearErrors } = useForm({
        submissions: platforms.map((p) => ({
            platform: p,
            link: '',
            proof: null,
        })),
    });

    // Clear backend errors for a specific row when the user starts typing/uploading
    const handleUpdate = (index, field, value) => {
        setLocalError(null);
        clearErrors(`submissions.${index}.link`, `submissions.${index}.proof`);

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

    const totalExpectedPayout = useMemo(() => {
        const completedCount = data.submissions.filter(s =>
            s.link.trim() !== '' && s.proof !== null
        ).length;
        return completedCount * Number(gig.payout);
    }, [data.submissions, gig.payout]);

    const submit = (e) => {
        e.preventDefault();

        // Check which ones have ANY data
        const activeSubmissions = data.submissions.filter(s => s.link.trim() !== '' || s.proof !== null);

        if (activeSubmissions.length === 0) {
            setLocalError("Please fill in at least one social media platform.");
            return;
        }

        // IMPORTANT: Strip out empty platforms before sending to backend
        // This stops the backend from seeing empty rows and triggering "required" errors on them.
        transform((data) => ({
            ...data,
            submissions: data.submissions.filter(s => s.link.trim() !== '' || s.proof !== null)
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

                {/* Error Banner */}
                {(localError || Object.keys(errors).length > 0) && (
                    <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-[2rem] flex items-start gap-4 animate-in fade-in duration-300">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">!</div>
                        <div>
                            <p className="text-red-900 text-sm font-black uppercase">Submission Error</p>
                            <p className="text-red-700 text-[11px] font-bold mt-0.5">
                                {localError || "Please fix the missing info in the highlighted platforms."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Submit Proof</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select the platforms you've used</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout</p>
                            <p className="text-3xl font-black text-green-600">₦{totalExpectedPayout.toLocaleString()}</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-6">
                        {data.submissions.map((item, index) => {
                            const style = getPlatformStyle(item.platform);

                            // We find errors by searching the error keys for the platform name
                            // because indexes might shift after transform()
                            const platformErrorKey = Object.keys(errors).find(key =>
                                key.includes(`submissions`) && data.submissions[index].platform === platforms[index]
                            );

                            const hasLinkError = errors[`submissions.${index}.link`];
                            const hasProofError = errors[`submissions.${index}.proof`];

                            const isActive = item.link.trim() !== '' || item.proof !== null;

                            return (
                                <div key={item.platform} className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                                    (hasLinkError || hasProofError)
                                        ? 'border-red-200 bg-red-50/50'
                                        : isActive
                                            ? 'border-pink-200 bg-pink-50/10'
                                            : 'border-gray-50 bg-gray-50/30 opacity-60'
                                }`}>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${style.classes}`}>
                                            {style.name}
                                        </span>
                                        {isActive && !hasLinkError && !hasProofError && (
                                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Active Submission</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="url"
                                                    placeholder="Paste Live Post Link"
                                                    className={`w-full rounded-xl text-sm font-bold p-3 border-2 transition-all ${
                                                        hasLinkError ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-pink-500'
                                                    }`}
                                                    value={item.link}
                                                    onChange={(e) => handleUpdate(index, 'link', e.target.value)}
                                                />
                                                {hasLinkError && <p className="mt-1 text-[9px] text-red-600 font-black uppercase px-1">{hasLinkError}</p>}
                                            </div>

                                            <div>
                                                <input type="file" id={`file-${index}`} className="hidden" accept="image/*" onChange={(e) => handleFileChange(index, item.platform, e.target.files[0])} />
                                                <label htmlFor={`file-${index}`} className={`block text-center py-3 bg-white border-2 border-dashed rounded-xl cursor-pointer text-[10px] font-black uppercase transition-all ${
                                                    hasProofError ? 'border-red-300 text-red-500' : 'border-gray-200 text-gray-400 hover:text-pink-600'
                                                }`}>
                                                    {item.proof ? '✓ Screenshot Attached' : 'Upload Screenshot'}
                                                </label>
                                                {hasProofError && <p className="mt-1 text-[9px] text-red-600 font-black uppercase px-1">{hasProofError}</p>}
                                            </div>
                                        </div>

                                        <div className="h-28 rounded-2xl overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-white shadow-inner">
                                            {previews[item.platform] ? (
                                                <img src={previews[item.platform]} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[8px] font-black uppercase text-gray-300 tracking-tighter">No Preview</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-5 bg-gray-900 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-pink-600 transition-all uppercase tracking-[0.2em] text-sm disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Complete My Payout'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
