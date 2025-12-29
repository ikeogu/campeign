import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import {
  DollarSign,
  CheckCircle,
  Clock,
  Zap,
  Briefcase,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import StatCard from '@/Components/dashboard/StatCard';
import { Link, usePage } from '@inertiajs/react';

export default function PromoterDashboard() {
  // Destructure from backend response
  const { stats, charts, recommendedGigs } = usePage().props;

  // Extract data with fallbacks to prevent crashes
  const earningsTrend = charts?.earningsTrend || [];
  const platformPerformance = charts?.platformPerformance || [];
  const gigs = recommendedGigs || [];

  return (
    <div className="space-y-8">
      {/* --- TOP BAR: PROMOTER LEVEL & WALLET --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Creator Hub
            <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest border border-green-200">
              {stats?.tier || 'Promoter'} Tier
            </span>
          </h1>
          <p className="text-gray-500 font-medium">Earn more by completing verified gig tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={route('promoter.gigs.index')}
            className="flex items-center gap-2 bg-green-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:bg-green-700 transition-all shadow-xl shadow-green-200"
          >
            <Briefcase className="w-4 h-4" />
            Browse Gigs
          </Link>
        </div>
      </div>

      {/* --- PROMOTER STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Payouts"
          value={`₦${(stats?.totalPayouts || 0).toLocaleString()}`}
          change={15.4}
          color="bg-green-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved Proofs"
          value={stats?.approvedProofs || 0}
          change={10.2}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          title="Pending Review"
          value={stats?.pendingProofs || 0}
          change={-2.5}
          color="bg-amber-500"
        />
        <StatCard
          icon={Zap}
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          change={0.5}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- EARNINGS AREA CHART --- */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Earnings Trend</h2>
            <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Earnings (₦)
                </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={earningsTrend}>
              <defs>
                <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
              <Tooltip
                formatter={(value) => [`₦${value.toLocaleString()}`, 'Earned']}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Area type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEarned)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* --- PLATFORM BREAKDOWN --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100 flex flex-col">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Platform Strength</h2>

          <div className="flex-grow">
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={platformPerformance} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="platform" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'black'}} width={80} />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                        {platformPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-green-700">
                <ShieldCheck className="w-5 h-5" />
                <p className="text-xs font-bold leading-tight">Your proofs have a high approval rate! Keep it up.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RECOMMENDED GIGS LIST --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Gigs Recommended for You</h2>
            <Link href={route('promoter.gigs.index')} className="text-xs font-black text-green-600 uppercase tracking-widest hover:underline">See All</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.length > 0 ? gigs.map((gig) => (
                <Link
                  key={gig.id}
                  href={route('promoter.gigs.show', gig.id)}
                  className="group p-6 rounded-[2rem] border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-green-100 hover:shadow-xl hover:shadow-green-500/5 transition-all cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                           {gig.icon || '📱'}
                        </div>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          ₦{(gig.payout || 0).toLocaleString()} / Gig
                        </span>
                    </div>
                    <h3 className="font-black text-gray-800 leading-tight group-hover:text-green-600 transition-colors line-clamp-2">
                        {gig.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">
                        {gig.slots_left || 0} Slots Left
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-[10px] font-black text-gray-400">
                           {gig.deadline || 'Limited time'}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
                    </div>
                </Link>
            )) : (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                  No recommended gigs at the moment.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
