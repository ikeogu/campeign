import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

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

        const hasEntries = data.submissions.some(s => s.link.trim() !== '' || s.proof !== null);
        
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
                    
                    {/* --- CENTRAL ERROR ALERT BOX --- */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-red-800 font-black text-sm uppercase tracking-tight">Submission Errors</h3>
                            </div>
                            <ul className="space-y-1">
                                {Object.entries(errors).map(([key, message]) => {
                                    // Extract index from "submissions.0.link"
                                    const match = key.match(/submissions\.(\d+)/);
                                    const platformName = match ? data.submissions[match[1]]?.platform : 'Submission';
                                    return (
                                        <li key={key} className="text-red-600 text-xs font-bold flex items-center gap-1">
                                            <span className="uppercase text-[10px] bg-red-100 px-1.5 py-0.5 rounded">{platformName}:</span>
                                            {message}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    {/* --- END ALERT BOX --- */}

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-pink-50 border-b border-gray-100">
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Proof of Work</h1>
                            <p className="text-gray-600 mt-1 italic">
                                Fill in used platforms. Total: <span className="text-green-600 font-bold">₦{Number(gig.payout).toLocaleString()}</span>
                            </p>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-10">
                            {data.submissions.map((item, index) => {
                                const style = getPlatformStyle(item.platform);
                                const isFilled = item.link.trim() !== '' || item.proof !== null;
                                const hasError = errors[`submissions.${index}.link`] || errors[`submissions.${index}.proof`];

                                return (
                                    <div key={item.platform} className={`transition-all duration-300 ${!isFilled ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${style.classes}`}>
                                                {style.name}
                                            </span>
                                            <div className="h-px flex-grow bg-gray-100"></div>
                                        </div>

                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all ${hasError ? 'border-red-300 bg-red-50/30' : (isFilled ? 'bg-white border-pink-200 shadow-sm' : 'bg-gray-50/50 border-gray-100')}`}>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Post Link</label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        className={`w-full rounded-xl text-sm py-3 transition-colors ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-pink-500'}`}
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
                                                        className={`flex items-center justify-center w-full py-3 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all text-sm font-bold ${item.proof ? 'bg-pink-50 border-pink-400 text-pink-600' : 'bg-transparent border-gray-300 text-gray-500 hover:border-pink-300'}`}
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
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 text-lg"
                                >
                                    {processing ? 'Uploading...' : 'Complete My Payout'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}