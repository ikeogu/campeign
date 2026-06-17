import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Withdraw({ banks }) {
    const { wallet, config, flash } = usePage().props;
    const [confirmed, setConfirmed] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        narration: '',
    });

    const FEE_PERCENTAGE = Number(config.transfer_fee) || 0;
    const inputAmount    = Number(data.amount) || 0;
    const calculatedFee  = (inputAmount * FEE_PERCENTAGE) / 100;
    const netPayout      = inputAmount - calculatedFee;
    const isOverBalance  = inputAmount > wallet;

    const detailsComplete =
        data.bank_code &&
        data.account_number.length === 10 &&
        data.account_name.trim().length >= 2;

    const canSubmit = detailsComplete && confirmed && !isOverBalance && inputAmount > 0;

    const submit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        post(route('withdraw.store'));
    };

    return (
        <AuthenticatedLayout header="Withdraw Earnings">
            <div className="max-w-xl mx-auto py-12 px-4">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">

                    {/* Balance */}
                    <div className="mb-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Wallet Balance</h2>
                        <p className="text-4xl font-black text-brand-600 tracking-tighter">₦{wallet.toLocaleString()}</p>
                    </div>

                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm">
                            {flash.error}
                        </div>
                    )}
                    {flash?.message && (
                        <div className="mb-6 p-4 bg-brand-50 border border-brand-200 text-brand-700 rounded-2xl font-bold text-sm flex items-center gap-3">
                            <div className="bg-brand-500 text-white rounded-full p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {flash.message}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">

                        {/* Amount */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Total Amount to Withdraw
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className={`w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500 transition-all ${isOverBalance ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                <button
                                    type="button"
                                    onClick={() => setData('amount', Math.floor(wallet).toString())}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors uppercase"
                                >
                                    Max
                                </button>
                            </div>
                            {isOverBalance && <p className="text-red-600 text-[10px] mt-2 font-bold uppercase">This amount exceeds your balance.</p>}
                            {errors.amount && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.amount}</p>}
                        </div>

                        {/* Bank */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Select Bank
                            </label>
                            <select
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500"
                                value={data.bank_code}
                                onChange={e => {
                                    const selected = banks.find(b => b.code === e.target.value);
                                    setData(prev => ({ ...prev, bank_code: e.target.value, bank_name: selected?.name ?? '' }));
                                    setConfirmed(false);
                                }}
                            >
                                <option value="">Choose your bank...</option>
                                {banks.map((bank, i) => (
                                    <option key={`${bank.code}-${i}`} value={bank.code}>{bank.name}</option>
                                ))}
                            </select>
                            {errors.bank_code && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.bank_code}</p>}
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Account Number
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="10"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold tracking-widest focus:ring-green-500"
                                value={data.account_number}
                                onChange={e => {
                                    setData('account_number', e.target.value.replace(/\D/g, ''));
                                    setConfirmed(false);
                                }}
                                placeholder="10-digit account number"
                            />
                            {errors.account_number && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_number}</p>}
                        </div>

                        {/* Account Name — user enters manually */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Account Name
                            </label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500"
                                value={data.account_name}
                                onChange={e => {
                                    setData('account_name', e.target.value);
                                    setConfirmed(false);
                                }}
                                placeholder="Full name on the bank account"
                            />
                            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                Enter the exact name registered on your bank account.
                            </p>
                            {errors.account_name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_name}</p>}
                        </div>

                        {/* Narration */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Narration (Optional)
                            </label>
                            <textarea
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-green-500 resize-none"
                                value={data.narration}
                                onChange={e => setData('narration', e.target.value)}
                                placeholder="Description of withdrawal"
                                rows="2"
                            />
                        </div>

                        {/* Fee breakdown */}
                        {inputAmount > 0 && (
                            <div className="bg-gray-50 p-5 rounded-[2rem] border border-dashed border-gray-200 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Total Wallet Deduction</span>
                                    <span className="text-gray-900 font-bold">₦{inputAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Processing Fee ({FEE_PERCENTAGE}%)</span>
                                    <span className="text-red-500">- ₦{calculatedFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-gray-900 font-black text-[11px] uppercase tracking-widest">Amount You Receive</span>
                                    <span className={`font-black text-lg ${isOverBalance ? 'text-red-600' : 'text-brand-600'}`}>
                                        ₦{netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Confirmation checkbox — shown once details are filled */}
                        {detailsComplete && (
                            <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 accent-brand-600 w-4 h-4 shrink-0"
                                    checked={confirmed}
                                    onChange={e => setConfirmed(e.target.checked)}
                                />
                                <span className="text-xs text-amber-800 font-bold leading-relaxed">
                                    I confirm that <span className="uppercase">{data.account_name}</span> at{' '}
                                    <span className="uppercase">{data.bank_name}</span> ({data.account_number}) is correct.
                                    Withdrawals sent to the wrong account cannot be reversed.
                                </span>
                            </label>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit || processing}
                            className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest"
                        >
                            {processing ? 'Processing...' : 'Confirm Withdrawal'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
