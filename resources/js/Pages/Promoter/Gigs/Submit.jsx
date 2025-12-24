import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react'; // Added useMemo for performance

const getPlatformStyle = (platform) => {
    const styles = {
        twitter: { name: 'X / Twitter', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
        instagram: { name: 'Instagram', classes: 'bg-pink-50 text-pink-600 border-pink-200' },
        facebook: { name: 'Facebook', classes: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        tiktok: { name: 'TikTok', classes: 'bg-slate-900 text-slate-100 border-slate-700' },
        youtube: { name: 'YouTube', classes: 'bg-red-50 text-red-600 border-red-200' },
    };
    return styles[platform?.toLowerCase()] || { name: platform, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export default function SubmitPage({ auth, gig }) {
    const platforms = gig?.platforms || [];
    const [previews, setPreviews] = useState({});

    const { data, setData, post, processing, errors, transform } = useForm({
        submissions: platforms.map((p) => ({
            platform: p,
            link: '',
            proof: null,
        })),
    });

    // --- CALCULATION LOGIC ---
    // Calculate how many platforms are currently "valid" (have link OR proof)
    const activeSubmissionsCount = useMemo(() => {
        return data.submissions.filter(s => s.link.trim() !== '' || s.proof !== null).length;
    }, [data.submissions]);

    const totalExpectedPayout = activeSubmissionsCount * Number(gig.payout);

    const handleUpdate = (index, field, value) => {
        const newSubmissions = [...data.submissions];
        newSubmissions[index][field] = value;
        setData('submissions', newSubmissions);
    };

    const handleFileChange = (index, platform, file) => {
        if (!file) return;
        handleUpdate(index, 'proof', file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [platform]: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    function submit(e) {
        e.preventDefault();
        const hasEntries = activeSubmissionsCount > 0;

        if (!hasEntries) {
            alert("Please provide at least one submission.");
            return;
        }

        transform((data) => ({
            ...data,
            submissions: data.submissions.filter(s => s.link.trim() !== '' && s.proof !== null)
        }));

        post(route('promoter.gigs.submit.store', gig.id), {
            forceFormData: true,
            onSuccess: () => alert('Submission successful!'),
        });
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">

                    {/* --- DYNAMIC CALCULATION HEADER --- */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-pink-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Proof of Work</h1>
                                <p className="text-gray-600 mt-1 italic text-sm">
                                    Base payout: <span className="font-bold">₦{Number(gig.payout).toLocaleString()}</span> per platform
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Expected Payout</p>
                                <p className="text-3xl font-black text-green-600">
                                    ₦{totalExpectedPayout.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-10">
                            {/* Calculation Info Alert */}
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="text-xs font-bold text-indigo-800">
                                    You are submitting <span className="underline underline-offset-2">{activeSubmissionsCount}</span> out of {platforms.length} platforms.
                                </p>
                            </div>

                            {data.submissions.map((item, index) => {
                                const style = getPlatformStyle(item.platform);
                                const isFilled = item.link.trim() !== '' || item.proof !== null;
                                const hasError = errors[`submissions.${index}.link`] || errors[`submissions.${index}.proof`];

                                return (
                                    <div key={item.platform} className={`transition-all duration-300 ${!isFilled ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${style.classes}`}>
                                                {style.name}
                                            </span>
                                            {isFilled && (
                                                <span className="text-[10px] font-bold text-green-600 animate-pulse">+ ₦{Number(gig.payout).toLocaleString()}</span>
                                            )}
                                            <div className="h-px flex-grow bg-gray-100"></div>
                                        </div>

                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all ${hasError ? 'border-red-300 bg-red-50/30' : (isFilled ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50/50 border-gray-100')}`}>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Post Link</label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        className={`w-full rounded-xl text-sm py-3 transition-colors ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'}`}
                                                        value={item.link}
                                                        onChange={(e) => handleUpdate(index, 'link', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Proof Image</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        className="hidden"
                                                        id={`file-${item.platform}`}
                                                        onChange={(e) => handleFileChange(index, item.platform, e.target.files[0])}
                                                    />
                                                    <label
                                                        htmlFor={`file-${item.platform}`}
                                                        className={`flex items-center justify-center w-full py-3 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all text-sm font-bold ${item.proof ? 'bg-green-50 border-green-400 text-green-600' : 'bg-transparent border-gray-300 text-gray-500 hover:border-green-300'}`}
                                                    >
                                                        {item.proof ? '✓ Attached' : 'Select File'}
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center border-2 border-white bg-white rounded-xl overflow-hidden shadow-inner min-h-[140px]">
                                                {previews[item.platform] ? (
                                                    <img src={previews[item.platform]} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <p className="text-[10px] text-gray-300 font-black uppercase italic">Not Provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 text-lg flex flex-col items-center"
                                >
                                    <span>{processing ? 'Uploading...' : 'Complete My Payout'}</span>
                                    {!processing && (
                                        <span className="text-xs font-bold opacity-80">Total: ₦{totalExpectedPayout.toLocaleString()}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
