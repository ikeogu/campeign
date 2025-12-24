import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

import { DollarSign, Eye, MousePointer, Users, Activity, TrendingUp } from 'lucide-react';
import StatCard from '@/Components/Dashboard/StatCard';

export default function CampaignerDashboard() {
  const campaignerSpendData = [
    { month: 'Jan', spend: 5200, impressions: 125000, clicks: 4200, conversions: 340 },
    { month: 'Feb', spend: 6800, impressions: 168000, clicks: 5600, conversions: 450 },
    { month: 'Mar', spend: 5900, impressions: 147000, clicks: 4900, conversions: 390 },
    { month: 'Apr', spend: 8200, impressions: 205000, clicks: 6800, conversions: 550 },
    { month: 'May', spend: 9500, impressions: 238000, clicks: 7900, conversions: 640 },
    { month: 'Jun', spend: 10200, impressions: 255000, clicks: 8500, conversions: 680 },
  ];

  const campaignerAdPerformance = [
    { name: 'Ad Set A', roi: 285, spend: 3400, revenue: 9690 },
    { name: 'Ad Set B', roi: 220, spend: 2800, revenue: 6160 },
    { name: 'Ad Set C', roi: 195, spend: 2100, revenue: 4095 },
    { name: 'Ad Set D', roi: 310, spend: 1900, revenue: 5890 },
  ];

  return (
    <>
      {/* Stat Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          icon={DollarSign}
          title="Total Spend"
          value="$10,200"
          change={7.3}
          color="bg-purple-500"
        />

        <StatCard
          icon={Eye}
          title="Impressions"
          value="255K"
          change={11.2}
          color="bg-blue-500"
        />

        <StatCard
          icon={MousePointer}
          title="Clicks"
          value="8,500"
          change={9.8}
          color="bg-green-500"
        />

        <StatCard
          icon={Users}
          title="Conversions"
          value="680"
          change={13.5}
          color="bg-orange-500"
        />

      </div>

      {/* Trend and ROI Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Spend & Conversions Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Spend & Conversions</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={campaignerSpendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={3} />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROI by Ad Set – Vertical Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">ROI by Ad Set</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignerAdPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="roi" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impressions & Clicks – Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Impressions & Clicks</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaignerSpendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="impressions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="clicks" fill="#ec4899" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
