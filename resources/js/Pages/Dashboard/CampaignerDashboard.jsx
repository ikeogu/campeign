import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

import {
  DollarSign,
  Eye,
  MousePointer,
  Users,
  Activity,
  TrendingUp,
  PlusCircle,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import StatCard from '@/Components/dashboard/StatCard';
import { Link, usePage  } from '@inertiajs/react';

export default function CampaignerDashboard() {
  // Updated mock data to reflect Nigerian market scale

  const { stats = {}, charts = {} } = usePage().props;

const campaignerSpendData = charts.monthly ?? [
    { month: 'Jan', spend: 55000, reach: 125000, submissions: 420 },
    { month: 'Feb', spend: 68000, reach: 168000, submissions: 560 },
    { month: 'Mar', spend: 95000, reach: 247000, submissions: 890 },
    { month: 'Apr', spend: 120000, reach: 305000, submissions: 1200 },
    { month: 'May', spend: 185000, reach: 438000, submissions: 1900 },
    { month: 'Jun', spend: 210000, reach: 555000, submissions: 2400 },
  ];
const campaignerCampaignPerformance = charts.campaignPerformance ??
[
    { name: 'Viral Tiktok', completion: 98, spend: 45000 },
    { name: 'IG Awareness', completion: 75, spend: 32000 },
    { name: 'X Re-posts', completion: 100, spend: 15000 },
    { name: 'YT Reviews', completion: 45, spend: 85000 },
  ];

  return (
    <div className="space-y-8">
      {/* --- TOP BAR: WELCOME & QUICK ACTIONS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Brand Command Center</h1>
          <p className="text-gray-500 font-medium">Manage your influence campaigns and track ROI.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={route('wallet.index')}
            className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Wallet className="w-4 h-4 text-purple-600" />
            Fund Wallet
          </Link>
          <Link
            href={route('campaigns.create')}
            className="flex items-center gap-2 bg-purple-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:bg-purple-700 transition-all shadow-xl shadow-purple-200"
          >
            <PlusCircle className="w-4 h-4" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* --- STAT OVERVIEW CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Ad Spend"
          value={`₦${stats.totalSpend.toLocaleString()}`}
          change={12.5}
          color="bg-purple-600"
        />
       {/*  <StatCard
          icon={Eye}
          title="Total Reach"
          value={`${Math.round(stats.totalReach / 1000)}K`}
          change={18.2}
          color="bg-indigo-500"
        /> */}
        <StatCard
          icon={CheckCircle2}
          title="Verified Gigs"
          value={stats.verifiedGigs}
          change={24.8}
          color="bg-emerald-500"
        />
      {/*   <StatCard
          icon={Activity}
          title="Avg. Engagement"
          value={`${stats.avgEngagement}%`}
          change={2.1}
          color="bg-pink-500"
        /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- MAIN CHART: SPEND VS REACH (2/3 width) --- */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Growth Analytics</h2>
              <p className="text-sm text-gray-400 font-medium">Spend vs Reach across all campaigns</p>
            </div>
            <select className="bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-500 px-4 focus:ring-purple-500">
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={campaignerSpendData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
              <Tooltip
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Area type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorSpend)" />
              <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={4} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* --- COMPLETION RATES BY CAMPAIGN (1/3 width) --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Campaign Health</h2>

          <div className="space-y-6">
            {campaignerCampaignPerformance.map((campaign) => (
              <div key={campaign.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-black text-gray-700">{campaign.name}</span>
                  <span className="font-bold text-purple-600">{campaign.completion}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${campaign.completion === 100 ? 'bg-emerald-500' : 'bg-purple-600'}`}
                    style={{ width: `${campaign.completion}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Budget: ₦{campaign.spend.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <Link href={route('campaigns.index')} className="mt-8 block text-center py-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:border-purple-200 hover:text-purple-600 transition-all">
            View All Campaigns
          </Link>
        </div>
      </div>

      {/* --- BOTTOM SECTION: SUBMISSIONS TRACKING --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Submission Volume</h2>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaignerSpendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
            <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
            <Bar dataKey="submissions" fill="#8b5cf6" radius={[10, 10, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
