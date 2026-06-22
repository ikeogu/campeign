import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PayoutAccount({ payoutAccount, banks, kyc }) {
    const { flash } = usePage().props;
    const [confirmed, setConfirmed] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        bank_code:      payoutAccount?.bank_code      ?? '',
        bank_name:      payoutAccount?.bank_name      ?? '',
        account_number: payoutAccount?.account_number ?? '',
        account_name:   payoutAccount?.account_name   ?? '',
    });

    const detailsComplete =
        data.bank_code &&
        data.account_number.length === 10 &&
        data.account_name.trim().length >= 2;

    const submit = (e) => {
        e.preventDefault();
        if (!confirmed) return;
        post(route('advertiser.payout-account.store'), {
            onSuccess: () => setConfirmed(false),
        });
    };

    const kycBlocked = !kyc || kyc.status !== 'approved';

    return (
        <AuthenticatedLayout header="Payout Account">
            <div className="max-w-xl mx-auto py-12 px-4">

                {/* KYC not approved */}
                {kycBlocked && (
                    <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                        <p className="text-sm font-black text-amber-800 mb-1">Identity Verification Required</p>
                        <p className="text-xs text-amber-700 mb-3">
                            You must complete identity verification before registering a payout account.
                        </p>
                        <a
                            href={route('kyc.show')}
                            className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors"
                        >
                            Verify Identity →
                        </a>
                    </div>
                )}

                {flash?.message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl font-bold text-sm flex items-center gap-3">
                        <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shrink-0">✓</span>
                        {flash.message}
                    </div>
                )}

                <div className={`bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 ${kycBlocked ? 'opacity-50 pointer-events-none' : ''}`}>

                    {/* Current saved account */}
                    {payoutAccount && (
                        <div className="mb-8 p-5 bg-brand-50 border border-brand-200 rounded-2xl">
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-3">Current Payout Account</p>
                            <p className="font-black text-gray-900">{payoutAccount.account_name}</p>
                            <p className="text-sm text-gray-500 font-bold font-mono tracking-widest">{payoutAccount.account_number}</p>
                            <p className="text-xs text-gray-400 mt-1">{payoutAccount.bank_name}</p>
                        </div>
                    )}

                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {payoutAccount ? 'Update Payout Account' : 'Register Payout Account'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        All withdrawals go to this account. The account name must match your verified identity.
                        To change it later, contact support.
                    </p>

                    <form onSubmit={submit} className="space-y-6">

                        {/* Bank */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Bank
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

                        {/* Account Number */}
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

                        {/* Account Name */}
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
                                placeholder="Exact name on the bank account"
                            />
                            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                Must match your verified identity or company name.
                            </p>
                            {errors.account_name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_name}</p>}
                        </div>

                        {/* Confirmation */}
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
                                    All future withdrawals will go to this account.
                                </span>
                            </label>
                        )}

                        <button
                            type="submit"
                            disabled={!confirmed || processing}
                            className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest"
                        >
                            {processing ? 'Saving...' : 'Save Payout Account'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
