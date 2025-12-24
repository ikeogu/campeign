import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Utility function to format currency
const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
};

export default function PromoterCampaignShow() {
    // Assuming 'gig' (the campaign) is passed via props
    const { gig, hasDownloaded, hasSubmitted } = usePage().props;
    const [downloaded, setDownloaded] = useState(false);

    // Dummy function for downloading (in a real app, this would trigger a file download)
    const handleDownload = (imageId) => {
        window.location.href = route('promoter.gigs.download', {
            id: gig.id,
            imageId: imageId
        });
    };

    const shareText = encodeURIComponent(
        `${gig.title}\n\n${gig.description}\n\nCheck it out!`
    );

    // Only share first image for now
    const shareImageUrl = gig.image_urls?.length > 0 ? gig.image_urls[0].url : null;

    // Social links
    const shareLinks = {
        whatsapp: `https://wa.me/?text=${shareText}`,
        twitter: `https://twitter.com/intent/tweet?text=${shareText}${shareImageUrl ? `%20${encodeURIComponent(shareImageUrl)}` : ''}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareImageUrl || ''}&quote=${shareText}`,
        instagram: shareImageUrl
            ? `instagram://library?AssetPath=${encodeURIComponent(shareImageUrl)}`
            : null,
    };


    return (
        <AuthenticatedLayout header={`Gig Details: ${gig.title}`}>
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Back Button */}
                    <Link
                        href={route('promoter.gigs.index')}
                        className="group flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 mb-8 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        Back to Available Gigs
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-pink-50 to-white px-8 py-6 border-b border-gray-100">
                            <h1 className="text-3xl font-bold text-gray-800">{gig.title}</h1>
                            <p className="text-gray-500 mt-1">Platform: <span className="font-semibold capitalize">{gig.platform}</span></p>
                        </div>

                        <div className="p-8 space-y-8">

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
                                    <p className="text-sm font-semibold text-gray-500">Payout (Your Earnings)</p>
                                    <p className="text-3xl font-extrabold text-green-700 mt-1">{formatCurrency(gig.payout)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-500">Required Followers</p>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1">{gig.target_followers?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="bg-pink-50 p-4 rounded-xl shadow-sm border border-pink-200">
                                    <p className="text-sm font-semibold text-gray-500">Available Slots</p>
                                    <p className="text-3xl font-extrabold text-pink-700 mt-1">{gig.available_slots?.toLocaleString() || 'Unlimited'}</p>
                                </div>
                            </div>

                            {/* Campaign Details */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">Campaign Description</h2>
                                <p className="text-gray-700">{gig.description}</p>
                            </div>

                            {/* Images/Content to Share */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Content to Share ({gig.image_urls?.length || 0} Assets)</h2>
                                <div className="flex flex-wrap gap-4">
                                    {gig.image_urls?.map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            className="w-24 h-24 object-cover rounded-lg shadow-md border-2 border-pink-300"
                                            alt="Content to share"
                                        />
                                    ))}
                                    {gig.image_urls?.length === 0 && <p className="text-gray-500 italic">No images provided. Campaign may require text only.</p>}
                                </div>
                            </div>

                            {/* Action Block */}
                            <div className="border-t border-gray-100 pt-6 space-y-6">

                                {/* 1. Social Share Section */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Share to Social Media</h2>

                                    <div className="flex flex-wrap gap-3">

                                        {/* WhatsApp */}
                                        <a
                                            href={shareLinks.whatsapp}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
                                        >
                                            Share on WhatsApp
                                        </a>

                                        {/* Twitter (X) */}
                                        <a
                                            href={shareLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
                                        >
                                            Share on Twitter
                                        </a>

                                        {/* Facebook */}
                                        <a
                                            href={shareLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-800 text-white rounded-xl shadow hover:bg-blue-900 transition"
                                        >
                                            Share on Facebook
                                        </a>

                                        {/* Instagram */}
                                        {shareLinks.instagram ? (
                                            <a
                                                href={shareLinks.instagram}
                                                className="px-4 py-2 bg-pink-600 text-white rounded-xl shadow hover:bg-pink-700 transition"
                                            >
                                                Post on Instagram
                                            </a>
                                        ) : (
                                            <button
                                                disabled
                                                className="px-4 py-2 bg-gray-300 text-gray-600 rounded-xl shadow cursor-not-allowed"
                                            >
                                                Instagram (image required)
                                            </button>
                                        )}

                                        {/* Copy Post Text */}
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`${gig.title}\n${gig.description}`)}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-xl shadow hover:bg-gray-800 transition"
                                        >
                                            Copy Text
                                        </button>
                                    </div>

                                </div>

                                {/* 2. Download -> Submit Flow */}
                               {!downloaded ? (
                                    <div className="space-y-3">
                                        {gig.image_urls?.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => handleDownload(img.id)}
                                                className="block text-blue-600 underline text-sm"
                                            >
                                                Download Image {img.id}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-green-600 font-semibold text-sm">
                                        Content downloaded. Proceed to submit proof.
                                    </p>
                                )}


                                {/* Submit Proof — ONLY WHEN SHARED */}
                                    {!hasSubmitted ? (
                                        <Link
                                            href={route('promoter.gigs.submit', gig.id)}
                                            className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition block"
                                        >
                                            Submit Proof of Sharing
                                        </Link>
                                    ): (
                                        <div className="w-full text-center bg-gray-100 text-gray-600 font-semibold py-4 rounded-xl border">
                                            Proof already submitted
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
