import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import { DollarSign, MousePointer, Target, Award, Activity, TrendingUp } from 'lucide-react';
import StatCard from '@/Components/Dashboard/StatCard';

export default function PromoterDashboard() {
  const promoterEarningsData = [
    { month: 'Jan', earnings: 2400, clicks: 4800, conversions: 120 },
    { month: 'Feb', earnings: 3200, clicks: 6200, conversions: 160 },
    { month: 'Mar', earnings: 2800, clicks: 5600, conversions: 140 },
    { month: 'Apr', earnings: 4100, clicks: 7800, conversions: 205 },
    { month: 'May', earnings: 4800, clicks: 9200, conversions: 240 },
    { month: 'Jun', earnings: 5200, clicks: 10400, conversions: 260 },
  ];

  const promoterCampaignData = [
    { name: 'Tech Products', value: 35 },
    { name: 'Fashion', value: 25 },
    { name: 'Home & Garden', value: 20 },
    { name: 'Health', value: 12 },
    { name: 'Others', value: 8 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} title="Total Earnings" value="$5,200" change={12.5} color="bg-green-500" />
        <StatCard icon={MousePointer} title="Total Clicks" value="10,400" change={8.3} color="bg-blue-500" />
        <StatCard icon={Target} title="Conversions" value="260" change={15.2} color="bg-purple-500" />
        <StatCard icon={Award} title="Active Campaigns" value="12" change={0} color="bg-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Earnings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={promoterEarningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Campaign Distribution</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={promoterCampaignData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                {promoterCampaignData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={promoterEarningsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="clicks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="conversions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
