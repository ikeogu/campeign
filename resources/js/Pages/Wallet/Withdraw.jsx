import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Withdraw({ banks, kyc_status, user_role, payout_account, withdrawal_count }) {
    const { wallet, config, flash } = usePage().props;
    const [confirmed, setConfirmed] = useState(false);

    const isAdvertiser  = user_role === 'campaigner';
    const KYC_THRESHOLD = 10000; // ₦10,000

    const { data, setData, post, processing, errors } = useForm({
        amount:         '',
        bank_code:      payout_account?.bank_code      ?? '',
        bank_name:      payout_account?.bank_name      ?? '',
        account_number: payout_account?.account_number ?? '',
        account_name:   payout_account?.account_name   ?? '',
        narration:      '',
    });

    const FEE_PERCENTAGE = Number(config.transfer_fee) || 0;
    const inputAmount    = Number(data.amount) || 0;
    const calculatedFee  = (inputAmount * FEE_PERCENTAGE) / 100;
    const netPayout      = inputAmount - calculatedFee;
    const isOverBalance  = inputAmount > wallet;

    // Promoters need KYC for: amounts above ₦10,000 OR from their 3rd withdrawal onwards
    const isThirdWithdrawal = !isAdvertiser && withdrawal_count >= 2;
    const needsKyc = !isAdvertiser && kyc_status !== 'approved' && (
        inputAmount > KYC_THRESHOLD || isThirdWithdrawal
    );

    const detailsComplete = isAdvertiser
        ? !!payout_account // advertisers just need an amount; bank details are pre-filled
        : data.bank_code && data.account_number.length === 10 && data.account_name.trim().length >= 2;

    const canSubmit = detailsComplete && confirmed && !isOverBalance && inputAmount > 0 && !needsKyc;

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
                            <span className="bg-brand-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shrink-0">✓</span>
                            {flash.message}
                        </div>
                    )}

                    {/* Advertiser: show saved payout account */}
                    {isAdvertiser && payout_account && (
                        <div className="mb-8 p-5 bg-brand-50 border border-brand-200 rounded-2xl">
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Payout Account</p>
                            <p className="font-black text-gray-900">{payout_account.account_name}</p>
                            <p className="text-sm font-bold text-gray-500 font-mono tracking-widest">{payout_account.account_number}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{payout_account.bank_name}</p>
                            <a
                                href={route('advertiser.payout-account')}
                                className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-brand-600 hover:underline"
                            >
                                Change account →
                            </a>
                        </div>
                    )}

                    {/* Advertiser with no payout account */}
                    {isAdvertiser && !payout_account && (
                        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                            <p className="text-sm font-black text-amber-800 mb-1">No Payout Account Set Up</p>
                            <p className="text-xs text-amber-700 mb-3">Register your bank account to start withdrawing.</p>
                            <a
                                href={route('advertiser.payout-account')}
                                className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors"
                            >
                                Set Up Payout Account →
                            </a>
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
                                    className={`w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-brand-500 transition-all ${isOverBalance ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                                    value={data.amount}
                                    onChange={e => {
                                        setData('amount', e.target.value);
                                        setConfirmed(false);
                                    }}
                                    placeholder="0.00"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setData('amount', Math.floor(wallet).toString()); setConfirmed(false); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors uppercase"
                                >
                                    Max
                                </button>
                            </div>
                            {isOverBalance && <p className="text-red-600 text-[10px] mt-2 font-bold uppercase">Amount exceeds your balance.</p>}
                            {errors.amount && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.amount}</p>}
                        </div>

                        {/* KYC prompt — amount threshold or 3rd withdrawal */}
                        {needsKyc && (
                            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                                <p className="text-sm font-black text-amber-800 mb-1">Identity Verification Required</p>
                                <p className="text-xs text-amber-700 mb-3">
                                    {isThirdWithdrawal
                                        ? 'From your 3rd withdrawal onwards, identity verification is required.'
                                        : 'Withdrawals above ₦10,000 require identity verification.'}
                                    {kyc_status === 'pending' ? ' Your submission is currently under review.' : ''}
                                </p>
                                {kyc_status !== 'pending' && (
                                    <a
                                        href={route('kyc.show')}
                                        className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors"
                                    >
                                        Verify Identity →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Bank details — only for promoters */}
                        {!isAdvertiser && (
                            <>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                        Select Bank
                                    </label>
                                    <select
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-brand-500"
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

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="10"
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold tracking-widest focus:ring-brand-500"
                                        value={data.account_number}
                                        onChange={e => {
                                            setData('account_number', e.target.value.replace(/\D/g, ''));
                                            setConfirmed(false);
                                        }}
                                        placeholder="10-digit account number"
                                    />
                                    {errors.account_number && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                        Account Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-brand-500"
                                        value={data.account_name}
                                        onChange={e => {
                                            setData('account_name', e.target.value);
                                            setConfirmed(false);
                                        }}
                                        placeholder="Full name on the bank account"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Enter the exact name on your bank account.</p>
                                    {errors.account_name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_name}</p>}
                                </div>
                            </>
                        )}

                        {/* Narration */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Narration (Optional)
                            </label>
                            <textarea
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-brand-500 resize-none"
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

                        {/* Confirmation checkbox */}
                        {detailsComplete && inputAmount > 0 && !needsKyc && (
                            <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 accent-brand-600 w-4 h-4 shrink-0"
                                    checked={confirmed}
                                    onChange={e => setConfirmed(e.target.checked)}
                                />
                                <span className="text-xs text-amber-800 font-bold leading-relaxed">
                                    I confirm withdrawal of ₦{inputAmount.toLocaleString()} to{' '}
                                    <span className="uppercase">
                                        {isAdvertiser ? payout_account?.account_name : data.account_name}
                                    </span>{' '}
                                    at{' '}
                                    <span className="uppercase">
                                        {isAdvertiser ? payout_account?.bank_name : data.bank_name}
                                    </span>{' '}
                                    ({isAdvertiser ? payout_account?.account_number : data.account_number}).
                                    This cannot be reversed.
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
