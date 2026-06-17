import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';

export default function FundWallet() {
    const { flash } = usePage().props;
    const opayPayment = flash?.opay_payment ?? null;

    const { data, setData, post, processing, errors } = useForm({ amount: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('wallet.fund.initialize'));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <AuthenticatedLayout header="Fund Your Wallet">
            <div className="max-w-md mx-auto py-12 px-4 space-y-6">

                {/* OPay bank transfer instructions */}
                {opayPayment && (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-[2.5rem] shadow-md space-y-4">
                        <h3 className="text-sm font-black text-green-800 uppercase tracking-tight">
                            Transfer to Complete Payment
                        </h3>
                        <p className="text-xs text-green-700">
                            Transfer exactly <span className="font-black">₦{Number(opayPayment.amount).toLocaleString()}</span> to the account below. Your wallet will be credited automatically once received.
                        </p>

                        <div className="space-y-3">
                            <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Bank</p>
                                    <p className="font-bold text-gray-800">{opayPayment.bank_name}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Account Number</p>
                                    <p className="font-black text-2xl text-gray-900 tracking-widest">{opayPayment.bank_account}</p>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(opayPayment.bank_account)}
                                    className="text-xs font-black text-brand-600 hover:text-brand-700 ml-4 shrink-0"
                                >
                                    Copy
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Amount</p>
                                <p className="font-black text-gray-900">₦{Number(opayPayment.amount).toLocaleString()}</p>
                            </div>

                            {opayPayment.expires_at && (
                                <p className="text-[10px] text-center text-orange-600 font-bold">
                                    Expires: {opayPayment.expires_at}
                                </p>
                            )}
                        </div>

                        <p className="text-[10px] text-gray-500 text-center">
                            Reference: {opayPayment.reference}
                        </p>
                    </div>
                )}

                {/* Fund form */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">
                        {opayPayment ? 'Fund Again' : 'Deposit Funds'}
                    </h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Amount (NGN)
                            </label>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 transition-all font-bold text-gray-700 shadow-sm"
                                placeholder="Min: 1000"
                                required
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>

                        <button
                            disabled={processing}
                            className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Get Bank Account'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
