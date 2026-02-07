// app/(main)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useAccount } from '@/app/context/AccountContext'; // Importamos el Contexto
import { getStats } from '@/app/actions';
import { Loader2, TrendingUp, TrendingDown, Activity, Wallet, Pencil } from 'lucide-react'; 
import { GrowthChart } from '@/components/GrowthChart';
import { SettingsModal } from '@/components/SettingsModal'; 

// Interface correcta
interface DashboardStats {
  netPnL: string;
  winRate: string;
  profitFactor: string;
  totalTrades: number;
  currentBalance: string;
  initialBalance: string;
  chartData: { date: string; balance: number; pnl: number }[]; 
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedAccount, isLoading: isAccountLoading } = useAccount(); // Usamos el contexto de cuentas
  
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    netPnL: "0.00",
    winRate: "0.0",
    profitFactor: "0.00",
    totalTrades: 0,
    currentBalance: "0.00",
    initialBalance: "0.00", 
    chartData: []
  });

  // Efecto: Cargar datos cuando cambia el usuario O la cuenta seleccionada
  useEffect(() => {
    if (user && selectedAccount) {
      loadStats(user.id, selectedAccount.id);
    }
  }, [user, selectedAccount]);

  async function loadStats(userId: string, accountId: number) {
    setLoading(true);
    // Ahora pasamos el accountId a la función getStats
    const { success, data } = await getStats(userId, accountId);
    
    if (success && data) {
      const backendData = data as any;
      
      setStats({
        netPnL: backendData.netPnL,
        winRate: backendData.winRate,
        profitFactor: backendData.profitFactor,
        totalTrades: backendData.totalTrades,
        currentBalance: backendData.currentBalance,
        initialBalance: backendData.initialBalance || "0", 
        chartData: backendData.chartData
      });
    }
    setLoading(false);
  }

  const pnlColor = Number(stats.netPnL) >= 0 ? 'text-[#00FF7F]' : 'text-red-500';

  // Si está cargando el contexto de cuentas o no hay cuenta seleccionada, mostramos loader
  if (isAccountLoading || !selectedAccount) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader2 className="animate-spin text-[#00FF7F]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          {/* Mostramos el nombre de la cuenta seleccionada dinámicamente */}
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            {selectedAccount.name} <span className="text-gray-600 text-lg font-normal">Dashboard</span>
          </h1>
          <p className="text-gray-400">Welcome back, trader. Here is your performance.</p>
        </div>
        
        <div className="bg-gradient-to-r from-[#1e2329] to-[#0b0e11] border border-gray-800 p-4 rounded-xl flex flex-col items-end min-w-[220px] relative group">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Current Balance</span>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-gray-600 hover:text-[#00A3FF] transition opacity-0 group-hover:opacity-100"
                  title="Edit Initial Balance"
                >
                  <Pencil size={12} />
                </button>
            </div>

            {loading ? (
                <div className="h-8 w-32 bg-gray-800 animate-pulse rounded"></div>
            ) : (
                <span className="text-4xl font-mono font-bold text-white">${stats.currentBalance}</span>
            )}
            
            {!loading && (
              <span className="text-[10px] text-gray-600 mt-1">
                Started with ${stats.initialBalance}
              </span>
            )}
        </div>
      </div>

       {/* Metrics Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-10 -mt-10 transition opacity-20 ${Number(stats.netPnL) >= 0 ? 'bg-[#00FF7F]' : 'bg-red-500'}`}></div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400"><Wallet size={20} /></div>
                <h3 className="text-gray-400 text-sm font-medium relative z-10">Net PnL</h3>
            </div>
            <p className={`text-3xl font-mono font-bold relative z-10 ${pnlColor}`}>
                {Number(stats.netPnL) > 0 ? '+' : ''}${stats.netPnL}
            </p>
          </div>

          <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400"><Activity size={20} /></div>
                <h3 className="text-gray-400 text-sm font-medium">Win Rate</h3>
            </div>
            <p className={`text-3xl font-mono font-bold ${Number(stats.winRate) >= 50 ? 'text-white' : 'text-yellow-500'}`}>
                {stats.winRate}%
            </p>
          </div>

          <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400"><TrendingUp size={20} /></div>
                <h3 className="text-gray-400 text-sm font-medium">Profit Factor</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-white">{stats.profitFactor}</p>
          </div>

          <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0b0e11] rounded-lg text-gray-400"><TrendingDown size={20} /></div>
                <h3 className="text-gray-400 text-sm font-medium">Total Trades</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-white">{stats.totalTrades}</p>
          </div>
       </div>

       {/* Chart Section */}
       <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 shadow-xl">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Account Growth</h3>
              <div className="flex gap-2">
                  <button className="text-xs bg-[#0b0e11] text-white px-3 py-1 rounded hover:bg-gray-700">All Time</button>
              </div>
           </div>
           
           {loading ? (
               <div className="h-[350px] flex items-center justify-center">
                   <Loader2 className="animate-spin text-gray-600" size={32} />
               </div>
           ) : stats.chartData.length > 0 ? (
               <GrowthChart data={stats.chartData} />
           ) : (
               <div className="h-[350px] flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                   <p>Not enough data to display chart yet.</p>
                   <p className="text-xs">Close more trades to see your curve.</p>
               </div>
           )}
       </div>

      {user && selectedAccount && ( // Asegúrate de verificar selectedAccount
        <SettingsModal 
            userId={user.id} 
            accountId={selectedAccount.id} // <--- AGREGAR ESTO
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            currentInitialBalance={stats.initialBalance}
        />
      )}
    </div>
  );
}