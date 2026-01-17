import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

// Utility function to format currency
const formatCurrency = (amount) => {
    // Ensure amount is treated as a number and format to Naira
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
};

export default function FundCampaign() {
    // Assuming the following props are passed from the Laravel controller:
    const { campaign, user_balance = 0 } = usePage().props;

    // Calculate the total estimated cost (Example: Payout * Target Shares)
    const estimatedCost = campaign.total_budget;

    // Calculate required funding: Cost minus current balance (if partial funding is allowed)
    // For simplicity, let's assume the user needs to fund the entire cost via this form.
    const requiredAmount = estimatedCost;

    const { data, setData, post, errors, processing } = useForm({
        campaign_id: campaign.id,
        amount: requiredAmount, // Pre-fill with the total required amount
    });

    // Determine the color of the balance display
    const balanceColor = user_balance < 500 ? 'text-red-600' : 'text-green-600';

    function submit(e) {
        e.preventDefault();

        // This would typically redirect to a payment gateway (e.g., Paystack, Flutterwave)
        post(route('campaigns.process_funding', campaign.id), {
        preserveScroll: true,
        onSuccess: (page) => {
            // Handle Paystack redirect
            if (page?.props?.redirect) {
                window.location.href = page.props.redirect;
                return;
            }

            // Wallet-only funding fallback
            console.log('Campaign funded from wallet');
        },
        onError: (err) => {
            console.error('Funding error:', err);
        }
    });

    }

    return (
        <AuthenticatedLayout header={`Fund: ${campaign.title}`}>
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Back Button */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href={route('campaigns.index')}
                            className="group flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                                <path d="m12 19-7-7 7-7"/>
                                <path d="M19 12H5"/>
                            </svg>
                            Back to Campaigns
                        </Link>
                    </div>

                    {/* Main Funding Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                        {/* Title Section */}
                        <div className="bg-gradient-to-r from-green-50 to-white px-8 py-6 border-b border-gray-100">
                            <h1 className="text-3xl font-bold text-gray-800">
                                Fund Campaign: {campaign.title}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Secure the budget needed to launch your campaign to promoters.
                            </p>
                        </div>

                        <div className="p-8 space-y-8">

                            {/* Balance and Cost Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 border-gray-100">

                                {/* Current Balance */}
                                <div className="bg-pink-50 p-4 rounded-xl shadow-sm text-center">
                                    <p className="text-sm font-semibold text-gray-500">Your Current Wallet</p>
                                    <p className={`text-2xl font-extrabold mt-1 ${balanceColor}`}>
                                        {formatCurrency(user_balance)}
                                    </p>
                                </div>

                                {/* Campaign Cost */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                    <p className="text-sm font-semibold text-gray-500">Estimated Campaign Cost</p>
                                    <p className="text-2xl font-extrabold text-gray-800 mt-1">
                                        {formatCurrency(estimatedCost)}
                                    </p>
                                </div>

                                {/* Required Funding */}
                                <div className="bg-red-50 p-4 rounded-xl shadow-md text-center">
                                    <p className="text-sm font-semibold text-red-600">Required Funding</p>
                                    <p className="text-2xl font-extrabold text-red-700 mt-1">
                                        {formatCurrency(requiredAmount)}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-6">

                                {/* Amount Input */}
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-bold text-gray-700 mb-2">
                                        Amount to Fund
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-xl font-bold">₦</span>
                                        </div>
                                        <input
                                            id="amount"
                                            type="number"
                                            step="any"
                                            min="100" // Minimum transaction limit
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all py-3 pl-8 pr-4 text-lg"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                        />
                                    </div>
                                    {errors.amount && <p className="mt-1 text-sm text-pink-600 font-medium">{errors.amount}</p>}
                                    <p className="mt-2 text-xs text-gray-500">
                                        This amount will be added to your wallet and immediately allocated to this campaign.
                                    </p>
                                </div>

                                {/* Payout Confirmation */}
                                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                                    <p className="text-sm text-gray-700">
                                        Your campaign requires **{formatCurrency(campaign.payout)}** payout for each of the **{campaign.target_shares}** target shares. Total estimated cost: **{formatCurrency(estimatedCost)}**.
                                    </p>
                                </div>

                                {/* Submission Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing || data.amount <= 0}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Initiating Payment...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Payment
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 12H3"/><path d="m16 7 5 5-5 5"/>
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
