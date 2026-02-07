// app/(main)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getStats } from '@/app/actions';
import { Loader2, TrendingUp, TrendingDown, Activity, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // State for statistics
  const [stats, setStats] = useState({
    netPnL: "0.00",
    winRate: "0.0",
    profitFactor: "0.00",
    totalTrades: 0
  });

  useEffect(() => {
    if (user) {
      loadStats(user.id);
    }
  }, [user]);

  async function loadStats(userId: string) {
    setLoading(true);
    const { success, data } = await getStats(userId);
    if (success && data) {
      setStats(data);
    }
    setLoading(false);
  }

  // Helper to determine color based on PnL
  const pnlColor = Number(stats.netPnL) >= 0 ? 'text-[#00FF7F]' : 'text-red-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Main Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.email || 'Trader'}. Here is your performance.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Net PnL */}
        <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-10 -mt-10 transition opacity-20 ${Number(stats.netPnL) >= 0 ? 'bg-[#00FF7F]' : 'bg-red-500'}`}></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400">
                <Wallet size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium relative z-10">Net PnL</h3>
          </div>
          {loading ? (
             <div className="h-10 w-24 bg-gray-800 animate-pulse rounded mt-1"></div>
          ) : (
            <>
                <p className={`text-3xl font-mono font-bold relative z-10 ${pnlColor}`}>
                    {Number(stats.netPnL) > 0 ? '+' : ''}${stats.netPnL}
                </p>
                <span className="text-xs text-gray-500 mt-2 block relative z-10">Total Realized Profit</span>
            </>
          )}
        </div>

         {/* Card 2: Win Rate */}
         <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400">
                <Activity size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Win Rate</h3>
          </div>
          {loading ? (
             <div className="h-10 w-20 bg-gray-800 animate-pulse rounded mt-1"></div>
          ) : (
             <p className={`text-3xl font-mono font-bold ${Number(stats.winRate) >= 50 ? 'text-white' : 'text-yellow-500'}`}>
                {stats.winRate}%
             </p>
          )}
          <p className="text-xs text-gray-500 mt-2">Target: &gt;50%</p>
        </div>

         {/* Card 3: Profit Factor */}
         <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400">
                <TrendingUp size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Profit Factor</h3>
          </div>
          {loading ? (
             <div className="h-10 w-16 bg-gray-800 animate-pulse rounded mt-1"></div>
          ) : (
             <p className={`text-3xl font-mono font-bold ${Number(stats.profitFactor) >= 1.5 ? 'text-[#00FF7F]' : 'text-white'}`}>
                {stats.profitFactor}
             </p>
          )}
           <p className="text-xs text-gray-500 mt-2">Gross Win / Gross Loss</p>
        </div>

         {/* Card 4: Total Trades */}
         <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400">
                <TrendingDown size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total Trades</h3>
          </div>
          {loading ? (
             <div className="h-10 w-12 bg-gray-800 animate-pulse rounded mt-1"></div>
          ) : (
             <p className="text-3xl font-mono font-bold text-white">{stats.totalTrades}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Closed positions</p>
        </div>

      </div>

      {/* Chart Placeholder (Next Step) */}
      <div className="bg-[#1e2329] p-8 rounded-2xl border border-gray-800 min-h-[400px] flex flex-col items-center justify-center text-gray-600 border-dashed">
         <Loader2 className="h-10 w-10 mb-4 opacity-20 animate-spin-slow" />
         <p>Chart data visualization coming next...</p>
      </div>
    </div>
  );
}