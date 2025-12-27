
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';

export default function FundWallet() {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Send to backend to initialize transaction and get redirect URL
        post(route('wallet.fund.initialize'));
    };

    return (
        <AuthenticatedLayout header="Fund Your Wallet">
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">Deposit Funds</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                Amount (NGN)
                            </label>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 transition-all font-bold text-gray-700 shadow-sm"
                                placeholder="Min: 1000"
                                required
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>

                        <button
                            disabled={processing}
                            className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
