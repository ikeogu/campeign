import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';

export default function WalletIndex() {
    const { wallet, transactions } = usePage().props;

    const formatAmount = (amt) =>

        `₦${Number(amt).toLocaleString('en-NG')}`;

    return (
        <AuthenticatedLayout header="My Wallet">
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* Wallet Balance */}
                    <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-2xl shadow-md border border-green-200 mb-8">
                        <h2 className="text-gray-600 font-semibold">Available Balance</h2>
                        <p className="text-4xl font-extrabold text-green-700 mt-2">
                            {formatAmount(wallet ?? 0)}
                        </p>
                    </div>

                    {/* Transactions */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
                            Transaction History
                        </h3>

                        <div className="mt-4 space-y-4">
                            {transactions.data.length === 0 && (
                                <p className="text-gray-500 italic">No transactions yet.</p>
                            )}

                            {transactions.data.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex justify-between p-4 rounded-lg border bg-gray-50"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{t.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {t.reference}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(t.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <div
                                        className={`font-extrabold ${
                                            t.type === 'credit'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount/100)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6">
                            {transactions.links?.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-lg mx-1 ${
                                        link.active
                                            ? 'bg-pink-600 text-white font-bold'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
