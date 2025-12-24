import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePage } from '@inertiajs/react';

export default function EarningsDashboard() {
    const { summary, chartData, recentEarnings } = usePage().props;

    return (
        <AuthenticatedLayout header="Promoter Earnings Analytics">
            <div className="space-y-10">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <SummaryCard label="Total Earnings" value={`₦${summary.totalEarnings}`} />
                    <SummaryCard label="Total Withdrawals" value={`₦${summary.totalWithdrawals}`} />
                    <SummaryCard label="Available Balance" value={`₦${summary.availableBalance}`} />
                    <SummaryCard label="Completed Promotions" value={summary.completedPromotions} />
                    <SummaryCard label="Pending Payments" value={summary.pendingPayments} />
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Last 30 Days Earnings</h2>
                    <LineChart width={900} height={350} data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
                    </LineChart>
                </div>

                {/* Recent Earnings */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Earnings</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-3">Campaign</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEarnings.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-3">{item.campaign?.title}</td>
                                    <td>₦{item.amount}</td>
                                    <td className="capitalize">{item.status}</td>
                                    <td>{item.completed_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">{label}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
    );
}
