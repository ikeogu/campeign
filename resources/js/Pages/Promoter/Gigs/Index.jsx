import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';

// Utility function to get platform icon/color (simplified)
const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
        case 'twitter':
        case 'x':
            return {
                name: 'X / Twitter',
                classes: 'bg-blue-50 text-blue-600 border-blue-200'
            };
        case 'instagram':
            return {
                name: 'Instagram',
                classes: 'bg-pink-50 text-pink-600 border-pink-200'
            };
        case 'facebook':
            return {
                name: 'Facebook',
                classes: 'bg-indigo-50 text-indigo-600 border-indigo-200'
            };
        case 'tiktok':
            return {
                name: 'TikTok',
                classes: 'bg-slate-900 text-slate-100 border-slate-700'
            };
        case 'youtube':
            return {
                name: 'YouTube',
                classes: 'bg-red-50 text-red-600 border-red-200'
            };
        default:
            return {
                name: platform,
                classes: 'bg-gray-50 text-gray-600 border-gray-200'
            };
    }
};

// Utility function to format currency
const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
};

export default function PromoterCampaignIndex() {
    // Assuming the controller passes 'gigs' (live campaigns)
    const { gigs, auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user} header="Available Gigs (Live Campaigns)">
            <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 pb-4 border-b border-gray-200">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Find Sharing Opportunities
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Select a campaign, share the content, and earn your payout instantly!
                        </p>
                    </div>

                    {/* Gigs Grid */}
                    {gigs.length === 0 ? (
                        <div className="p-12 bg-white rounded-2xl text-center shadow-lg border border-pink-100">
                            <h3 className="text-xl font-bold text-gray-700">
                                No Gigs Available Right Now
                            </h3>
                            <p className="text-gray-500 mt-2">
                                Check back later for new campaigns that match your profile.
                            </p>
                        </div>
                    ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gigs.map((gig) => {
                                return (
                                    <div
                                        key={gig.id}
                                        className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 p-6 flex flex-col border border-pink-100"
                                    >
                                        <div className="flex-grow">
                                           {/* Payout & Platform Badges */}
                                            <div className="flex justify-between items-start mb-4">
                                                {/* Platform Pill Container */}
                                                <div className="flex flex-wrap gap-1.5 max-w-[65%]">
                                                    {gig.platforms && gig.platforms.map((p, idx) => {
                                                        const style = getPlatformStyle(p);
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className={`
                                                                    text-[10px] uppercase tracking-widest font-extrabold
                                                                    px-2.5 py-1 rounded-md border shadow-sm
                                                                    ${style.classes}
                                                                `}
                                                            >
                                                                {style.name}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                {/* Payout Badge (Theme Green) */}
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Payout</span>
                                                    <div className="text-lg font-black text-green-700">
                                                        {formatCurrency(gig.payout)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h2 className="font-extrabold text-xl text-gray-900 line-clamp-2 min-h-[3rem]">
                                                {gig.title}
                                            </h2>

                                            {/* Description */}
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-3 min-h-[3.75rem]">
                                                {gig.description}
                                            </p>

                                            {/* Target & Images */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold text-pink-600">Target Shares:</span> {gig.target_shares}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold text-pink-600">Min. Followers:</span> {gig.min_followers?.toLocaleString() || 'N/A'}
                                                </p>

                                                {/* Images Preview */}
                                                {gig.image_urls && gig.image_urls.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {gig.image_urls.slice(0, 3).map((img, index) => (
                                                            <img
                                                                key={img.id}
                                                                src={img.url}
                                                                className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                                                alt={`Image ${index + 1}`}
                                                            />
                                                        ))}
                                                        {gig.image_urls.length > 3 && (
                                                            <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center text-xs font-semibold">
                                                                +{gig.image_urls.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <Link
                                                href={route('promoter.gigs.show', gig.id)}
                                                className="w-full text-center bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition shadow-md block"
                                            >
                                                View Criteria & Share
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
