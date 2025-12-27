import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Withdraw({ banks }) {
    const { auth, wallet } = usePage().props;
    const [accountName, setAccountName] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        bank_code: '',
        account_number: '',
    });

    const transferFee = 25; // This should ideally come from props.config
    const amount = Number(data.amount) || 0;
    const netPayout = amount > transferFee ? amount - transferFee : 0;

    // Effect to verify account number via Paystack Resolve API
    useEffect(() => {
        if (data.account_number.length === 10 && data.bank_code) {
            resolveAccount();
        }
    }, [data.account_number, data.bank_code]);

    const resolveAccount = async () => {
        setIsValidating(true);
        try {
            // You would call your backend route which proxies Paystack's Resolve API
            const response = await fetch(route('api.bank.resolve', {
                account_number: data.account_number,
                bank_code: data.bank_code
            }));
            const result = await response.json();
            setAccountName(result.account_name);
        } catch (e) {
            setAccountName('Could not verify account');
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
                    <div className="mb-8">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Available for Withdrawal</h2>
                        <p className="text-4xl font-black text-green-600 tracking-tighter">₦{wallet.toLocaleString()}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Amount */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Amount to Withdraw</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-green-500"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                placeholder="0.00"
                            />
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
                                {/* Combine code and index to ensure absolute uniqueness */}
                                {banks.map((bank, index) => (
                                    <option key={`${bank.code}-${index}`} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
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
                            {isValidating && <p className="text-[10px] text-blue-500 font-bold mt-1">Verifying account...</p>}
                            {accountName && <p className="text-[10px] text-green-600 font-black mt-1 uppercase tracking-widest">{accountName}</p>}
                            {errors.account_number && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.account_number}</p>}
                        </div>
                        {/* Net Payout Info */}
                        {amount > 0 && (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Transfer Fee</span>
                                    <span className="text-red-500">- ₦{transferFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                    <span className="text-gray-900 font-black text-xs uppercase tracking-widest">Net to Bank</span>
                                    <span className="text-green-600 font-black text-sm">₦{netPayout.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing || !accountName || isValidating}
                            className="w-full py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
                        >
                            {processing ? 'Processing Payout...' : 'Confirm Withdrawal'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}