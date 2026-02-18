import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Withdraw({ banks }) {
    const { auth, wallet, config, flash } = usePage().props;
    const [accountName, setAccountName] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        bank_code: '',
        account_number: '',
        account_name: '',
        narration: '',
    });

    // --- CALCULATIONS ---
    const FEE_PERCENTAGE = Number(config.transfer_fee) || 0;
    const inputAmount = Number(data.amount) || 0;

    // Fee is based on the input amount
    const calculatedFee = (inputAmount * FEE_PERCENTAGE) / 100;

    // What the user actually gets in their bank
    const netPayout = inputAmount;

    // Total leaving the wallet (Amount requested + the fee)
    const totalDeduction = inputAmount + calculatedFee;

    // Check if the total cost exceeds the available wallet balance
    const isOverBalance = totalDeduction > wallet;

    // --- ACCOUNT RESOLUTION ---
    useEffect(() => {
        if (data.account_number.length === 10 && data.bank_code) {
            resolveAccount();
        } else {
            setAccountName('');
        }
    }, [data.account_number, data.bank_code]);


    const resolveAccount = async () => {
        setIsValidating(true);
        try {
            const response = await fetch(route('api.bank.resolve', {
                account_number: data.account_number,
                bank_code: data.bank_code
            }));
            const result = await response.json();
            if (result.account_name) {
                setAccountName(result.account_name);
                setData('account_name', result.account_name);
            } else {
                setAccountName('Could not verify account');
            }
        } catch (e) {
            setAccountName('Error verifying account');
        } finally {
            setIsValidating(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('withdraw.store'));
    };

    return (
        <AuthenticatedLayout header="Withdraw Earnings">

            <div className="max-w-xl mx-auto py-12 px-4">

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">

                    {/* Header: Available Balance */}
                    <div className="mb-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Wallet Balance</h2>
                        <p className="text-4xl font-black text-green-600 tracking-tighter">₦{wallet.toLocaleString()}</p>
                    </div>

                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm">
                        ⚠️ {flash.error}
                    </div>
                    )}
                    {/* Add this inside your return, right above the form */}
                    {flash?.message && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-bold text-sm flex items-center gap-3 animate-in fade-in zoom-in">
                            <div className="bg-green-500 text-white rounded-full p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {flash.message}
                        </div>
                    )}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Amount Field */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Amount to Withdraw
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className={`w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500 transition-all ${
                                        isOverBalance ? 'border-red-500 ring-2 ring-red-500/20' : ''
                                    }`}
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Calculate max amount where (Amount + Fee) <= Wallet
                                        const maxAmount = wallet / (1 + FEE_PERCENTAGE / 100);
                                        setData('amount', Math.floor(maxAmount).toString());
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors uppercase"
                                >
                                    Max
                                </button>
                            </div>

                            {/* Over-balance Error Message */}
                            {isOverBalance && (
                                <div className="mt-2 flex gap-2 items-start bg-red-50 p-3 rounded-xl border border-red-100">
                                    <span className="text-red-500">⚠️</span>
                                    <p className="text-red-600 text-[10px] font-bold leading-tight uppercase">
                                        Insufficient Balance: Your total cost (₦{totalDeduction.toLocaleString()}) exceeds your balance.
                                        Please enter a lower amount.
                                    </p>
                                </div>
                            )}
                            {errors.amount && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.amount}</p>}
                        </div>

                        {/* Bank Selection */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Select Bank</label>
                            <select
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500"
                                value={data.bank_code}
                                onChange={e => setData('bank_code', e.target.value)}
                            >
                                <option value="">Choose your bank...</option>
                                {banks.map((bank, index) => (
                                    <option key={`${bank.code}-${index}`} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                            {errors.bank_code && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.bank_code}</p>}
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Account Number</label>
                            <input
                                type="text"
                                maxLength="10"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500"
                                value={data.account_number}
                                onChange={e => setData('account_number', e.target.value)}
                                placeholder="10-digit account number"
                            />
                            {isValidating && <p className="text-[10px] text-blue-500 font-bold mt-2 animate-pulse">Verifying account...</p>}
                            {accountName && (
                                <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${
                                    accountName.includes('Could not') ? 'text-red-500' : 'text-green-600'
                                }`}>
                                    {accountName}
                                </p>
                            )}
                            {errors.account_number && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_number}</p>}
                        </div>

                        {/* Narration Field (NEW) */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Narration / Remark (Optional)</label>
                            <textarea
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-green-500 resize-none"
                                value={data.narration}
                                onChange={e => setData('narration', e.target.value)}
                                placeholder="e.g. Savings withdrawal"
                                rows="2"
                            />
                            {errors.narration && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.narration}</p>}
                        </div>

                        {/* Transaction Summary Breakdown */}
                        {inputAmount > 0 && (
                            <div className="bg-gray-50 p-5 rounded-[2rem] border border-dashed border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Withdrawal Amount</span>
                                    <span className="text-gray-900">₦{inputAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Processing Fee ({FEE_PERCENTAGE}%)</span>
                                    <span className="text-red-500">+ ₦{calculatedFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-gray-900 font-black text-[11px] uppercase tracking-widest">Total to be Deducted</span>
                                    <span className={`font-black text-lg ${isOverBalance ? 'text-red-600' : 'text-gray-900'}`}>
                                        ₦{totalDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !accountName ||
                                accountName.includes('Could not') ||
                                isValidating ||
                                isOverBalance ||
                                inputAmount <= 0
                            }
                            className="w-full py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale uppercase text-[10px] tracking-widest"
                        >
                            {processing ? 'Processing Payout...' : 'Confirm Withdrawal'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
