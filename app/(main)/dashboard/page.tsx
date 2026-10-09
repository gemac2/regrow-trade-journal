// app/(main)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useAccount } from '@/app/context/AccountContext';
import { getStats, getCalendarData, getStrategyStats, getHedgeStats } from '@/app/actions'; 
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Wallet, 
  Pencil, 
  PieChart as PieIcon, 
  Clock, 
  Plus, 
  ShieldCheck, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'; 
import { GrowthChart } from '@/components/GrowthChart';
import { SettingsModal } from '@/components/SettingsModal'; 
import { PnLCalendar } from '@/components/PnLCalendar'; 
import { StrategyDonut } from '@/components/StrategyDonut'; 
import { HedgeAnalytics } from '@/components/HedgeAnalytics';
import { TradeModal } from '@/components/TradeModal';

interface DashboardStats {
  netPnL: string;
  winRate: string;
  profitFactor: string;
  totalTrades: number;
  currentBalance: string;
  initialBalance: string;
  chartData: { date: string; balance: number; pnl: number }[]; 
  totalFrozenLoss?: string;
  managingCount?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedAccount, isLoading: isAccountLoading } = useAccount();
  
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    netPnL: "0.00",
    winRate: "0.0",
    profitFactor: "0.00",
    totalTrades: 0,
    currentBalance: "0.00",
    initialBalance: "0.00", 
    chartData: [],
    totalFrozenLoss: "0.00",
    managingCount: 0
  });

  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [strategyData, setStrategyData] = useState<any[]>([]);
  const [hedgeData, setHedgeData] = useState<any>(null);

  useEffect(() => {
    if (user && selectedAccount) {
      loadData(user.id, selectedAccount.id);
    }
  }, [user, selectedAccount]);

  async function loadData(userId: string, accountId: number) {
    setLoading(true);
    
    const [statsRes, calendarRes, strategyRes, hedgeRes] = await Promise.all([
      getStats(userId, accountId),
      getCalendarData(userId, accountId),
      getStrategyStats(userId, accountId),
      getHedgeStats(userId, accountId)
    ]);
    
    if (statsRes.success && statsRes.data) {
      const backendData = statsRes.data as any;
      setStats({
        netPnL: backendData.netPnL,
        winRate: backendData.winRate,
        profitFactor: backendData.profitFactor,
        totalTrades: backendData.totalTrades,
        currentBalance: backendData.currentBalance,
        initialBalance: backendData.initialBalance || "0", 
        chartData: backendData.chartData || [],
        totalFrozenLoss: backendData.totalFrozenLoss || "0.00",
        managingCount: backendData.managingCount || 0
      });
    }

    if (calendarRes.success && calendarRes.data) {
      setCalendarData(calendarRes.data as any[]);
    }

    if (strategyRes.success && strategyRes.data) {
      setStrategyData(strategyRes.data as any[]);
    }

    if (hedgeRes.success && hedgeRes.data) {
      setHedgeData(hedgeRes.data);
    }

    setLoading(false);
  }

  const netPnlNum = Number(stats.netPnL);
  const isPnlPositive = netPnlNum >= 0;
  const initialBalNum = Number(stats.initialBalance) || 1;
  const returnPercentage = ((netPnlNum / initialBalNum) * 100).toFixed(2);
  const winRateNum = Number(stats.winRate);
  const profitFactorNum = Number(stats.profitFactor);

  if (isAccountLoading || !selectedAccount) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#00E599]" size={36} />
          <p className="text-xs text-slate-400 font-mono">Sincronizando cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* --- HERO HEADER CON CAPITAL Y ACCIONES --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-[#121824] via-[#161D2B] to-[#121824] p-6 rounded-2xl border border-white/[0.08] shadow-xl relative overflow-hidden">
        
        {/* Glow de fondo decorativo */}
        <div className={`absolute -right-10 -top-10 w-60 h-60 rounded-full blur-[100px] pointer-events-none opacity-25 ${
          isPnlPositive ? 'bg-[#00E599]' : 'bg-rose-500'
        }`} />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
              Terminal Operativa
            </span>
            <span className="text-xs text-slate-400">ID #{selectedAccount.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {selectedAccount.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control de rendimiento, balance de capital y gestión de riesgo en tiempo real.
          </p>
        </div>

        {/* Hero Card de Balance y Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-4 z-10">
          <div className="bg-[#0D1117] p-4 rounded-xl border border-white/[0.08] flex flex-col min-w-[230px] shadow-inner relative group">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet size={12} className="text-[#00A3FF]" /> Saldo Actual
              </span>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-slate-500 hover:text-[#00A3FF] transition p-1 hover:bg-white/[0.06] rounded-md cursor-pointer"
                title="Editar Balance Inicial"
              >
                <Pencil size={12} />
              </button>
            </div>

            {loading ? (
              <div className="h-8 w-32 bg-slate-800 animate-pulse rounded my-1"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  ${Number(stats.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            {!loading && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-white/[0.04] text-[11px]">
                <span className="text-slate-400">
                  Base: ${Number(stats.initialBalance).toLocaleString()}
                </span>
                <span className={`font-mono font-bold flex items-center ${
                  isPnlPositive ? 'text-[#00E599]' : 'text-rose-400'
                }`}>
                  {isPnlPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {isPnlPositive ? '+' : ''}{returnPercentage}%
                </span>
              </div>
            )}

            {stats.totalFrozenLoss && Number(stats.totalFrozenLoss) > 0 && (
              <div className="mt-2 text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1.5" title="Flotante negativo pendiente descontado del balance mientras esté en gestión">
                <Clock size={11} className="animate-spin text-amber-400" />
                <span>-${stats.totalFrozenLoss} flotante ({stats.managingCount} en gestión)</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsTradeModalOpen(true)}
            className="h-full py-4 px-5 rounded-xl bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 font-bold text-sm hover:brightness-105 transition-all shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_25px_rgba(0,229,153,0.45)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={18} className="stroke-[2.5]" />
            <span>Registrar Trade</span>
          </button>
        </div>
      </div>

      {/* --- METRICS GRID (4 CARDS FINTECH) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. NET PNL */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden group hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className={isPnlPositive ? 'text-[#00E599]' : 'text-rose-400'} /> PnL Neto
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isPnlPositive ? 'bg-[#00E599]/15 text-[#00E599]' : 'bg-rose-500/15 text-rose-400'
            }`}>
              {isPnlPositive ? '+' : ''}{returnPercentage}% ROI
            </span>
          </div>
          <p className={`text-3xl font-mono font-bold tracking-tight ${
            isPnlPositive ? 'text-[#00E599]' : 'text-rose-400'
          }`}>
            {isPnlPositive ? '+' : ''}${Number(stats.netPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Ganancia/Pérdida acumulada total
          </p>
        </div>

        {/* 2. WIN RATE */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-[#00A3FF]" /> Ratio Acierto (WR)
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              winRateNum >= 50 ? 'bg-[#00E599]/15 text-[#00E599]' : 'bg-amber-500/15 text-amber-400'
            }`}>
              {winRateNum >= 50 ? 'Sólido' : 'Bajo'}
            </span>
          </div>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            {stats.winRate}%
          </p>
          
          {/* Mini barra de progreso */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden flex">
            <div 
              style={{ width: `${Math.min(100, Math.max(0, winRateNum))}%` }} 
              className="bg-[#00E599] transition-all duration-500" 
            />
            <div 
              style={{ width: `${Math.min(100, Math.max(0, 100 - winRateNum))}%` }} 
              className="bg-rose-500 transition-all duration-500" 
            />
          </div>
        </div>

        {/* 3. PROFIT FACTOR */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-purple-400" /> Profit Factor
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              profitFactorNum >= 2.0 ? 'bg-[#00E599]/15 text-[#00E599]' :
              profitFactorNum >= 1.2 ? 'bg-[#00A3FF]/15 text-[#00A3FF]' :
              'bg-slate-800 text-slate-400'
            }`}>
              {profitFactorNum >= 2.0 ? 'Excelente' : profitFactorNum >= 1.2 ? 'Rentable' : 'Subóptimo'}
            </span>
          </div>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            {stats.profitFactor}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Relación Ganancias Brutas / Pérdidas
          </p>
        </div>

        {/* 4. TOTAL TRADES */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown size={14} className="text-yellow-400" /> Operaciones
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#0D1117] text-slate-300 px-2 py-0.5 rounded-full border border-white/[0.06]">
              Histórico
            </span>
          </div>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            {stats.totalTrades}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Total de operaciones computadas
          </p>
        </div>

      </div>

      {/* --- CHARTS ROW (Growth + Strategies) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Growth Chart (2/3 de ancho) */}
        <div className="lg:col-span-2 bg-[#121824] p-6 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Curva de Crecimiento del Capital</h3>
              <p className="text-xs text-slate-400">Evolución cronológica del balance tras cada trade</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[11px] font-bold bg-[#0D1117] text-slate-300 px-3 py-1 rounded-lg border border-white/[0.08]">
                Historial Completo
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-h-[320px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-600" size={32} />
              </div>
            ) : stats.chartData.length > 0 ? (
              <GrowthChart data={stats.chartData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/[0.08] rounded-xl p-8 text-center space-y-2">
                <p className="text-sm">Sin suficientes datos para proyectar el gráfico.</p>
                <p className="text-xs text-slate-400">Registra tus operaciones cerradas para visualizar la curva de crecimiento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Strategy Donut (1/3 de ancho) */}
        <div className="lg:col-span-1 bg-[#121824] p-6 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PieIcon size={18} className="text-[#00A3FF]" /> 
                Fuente de Ganancias
              </h3>
              <p className="text-xs text-slate-400">Rendimiento agrupado por estrategia</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-600" size={32} />
              </div>
            ) : (
              <StrategyDonut data={strategyData} />
            )}
          </div>
        </div>

      </div>

      {/* --- HEDGE ANALYTICS (Full Width) --- */}
      <HedgeAnalytics 
        data={hedgeData} 
        loading={loading} 
        accountName={selectedAccount.name}
        userId={user?.id}
        accountId={selectedAccount.id}
        stats={stats}
      />

      {/* --- CALENDAR ROW (Full Width) --- */}
      <div className="grid grid-cols-1">
        <div className="h-auto">
          {loading ? (
            <div className="h-[340px] bg-[#121824] rounded-2xl border border-white/[0.08] animate-pulse" />
          ) : (
            <PnLCalendar data={calendarData} />
          )}
        </div>
      </div>

      {/* Modal Ajustes Balance */}
      {user && selectedAccount && (
        <SettingsModal 
          userId={user.id} 
          accountId={selectedAccount.id}
          isOpen={isSettingsOpen} 
          onClose={() => {
            setIsSettingsOpen(false);
            loadData(user.id, selectedAccount.id);
          }}
          currentInitialBalance={stats.initialBalance}
        />
      )}

      {/* Modal Crear Trade desde Dashboard */}
      {user && selectedAccount && (
        <TradeModal 
          userId={user.id} 
          accountId={selectedAccount.id}
          isOpen={isTradeModalOpen} 
          onClose={() => {
            setIsTradeModalOpen(false);
            loadData(user.id, selectedAccount.id);
          }} 
        />
      )}
    </div>
  );
}