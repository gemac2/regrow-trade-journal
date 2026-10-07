// components/HedgeAnalytics.tsx
'use client';

import { ShieldCheck, ShieldAlert, ArrowRightLeft, Percent, Wallet, Layers, CheckCircle2, XCircle, MinusCircle, HelpCircle, Clock } from 'lucide-react';

interface HedgeData {
  totalHedgeTrades: number;
  notTriggeredCount: number;
  notTriggeredRate: string;
  triggeredCount: number;
  triggeredRate: string;
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  managingCount?: number;
  managingRate?: string;
  winRate: string;
  lossRate: string;
  breakevenRate: string;
  totalHedgePnl: string;
  totalHedgeWinsPnl: string;
  totalHedgeLossesPnl: string;
  totalManagingFrozenLoss?: string;
  avgRiskPercent: string;
}

interface HedgeAnalyticsProps {
  data: HedgeData | null;
  loading?: boolean;
}

export function HedgeAnalytics({ data, loading }: HedgeAnalyticsProps) {
  if (loading) {
    return (
      <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-gray-800/60 rounded-xl"></div>
          <div className="h-24 bg-gray-800/60 rounded-xl"></div>
          <div className="h-24 bg-gray-800/60 rounded-xl"></div>
          <div className="h-24 bg-gray-800/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data || data.totalHedgeTrades === 0) {
    return (
      <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20">
          <Layers size={26} />
        </div>
        <h3 className="text-lg font-bold text-white">Sistema de Coberturas (Hedge Mode)</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Aún no tienes operaciones registradas con Modo Hedge activado. Cuando crees o edites un trade activando el toggle de <span className="text-[#00A3FF] font-medium">Modo Hedge</span>, aquí verás las estadísticas de efectividad, riesgo y resultado de tus coberturas.
        </p>
      </div>
    );
  }

  const netPnlNum = parseFloat(data.totalHedgePnl);
  const netPnlColor = netPnlNum > 0 ? 'text-[#00FF7F]' : netPnlNum < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-[#00A3FF]/20 to-[#00FF7F]/10 text-[#00A3FF] rounded-xl border border-[#00A3FF]/30">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Hedge Analytics <span className="text-xs font-normal text-gray-500 uppercase tracking-wider">Estadísticas de Cobertura</span>
              </h2>
              <p className="text-xs text-gray-400">
                Métricas detalladas sobre operaciones en modo cobertura, ratio de activación y PnL de hedge
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0b0e11] px-3.5 py-1.5 rounded-xl border border-gray-800 flex items-center gap-2">
            <span className="text-[11px] text-gray-500 uppercase font-semibold">Total Hedge</span>
            <span className="text-sm font-bold text-white font-mono">{data.totalHedgeTrades} ops</span>
          </div>
          <div className="bg-[#0b0e11] px-3.5 py-1.5 rounded-xl border border-gray-800 flex items-center gap-2">
            <span className="text-[11px] text-gray-500 uppercase font-semibold">Riesgo Promedio</span>
            <span className="text-sm font-bold text-[#00A3FF] font-mono">{data.avgRiskPercent}%</span>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. NO TOCARON COBERTURA */}
        <div className="bg-[#0b0e11] p-4 rounded-xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} /> No Tocaron Cobertura
            </span>
            <span className="text-[11px] font-mono font-bold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/20">
              {data.notTriggeredRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.notTriggeredCount}</p>
            <span className="text-xs text-gray-500">de {data.totalHedgeTrades} ops</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Operaciones directas que no requirieron abrir orden hedge.
          </p>
        </div>

        {/* 2. COBERTURAS GANADAS */}
        <div className="bg-[#0b0e11] p-4 rounded-xl border border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Coberturas Ganadas
            </span>
            <span className="text-[11px] font-mono font-bold bg-green-500/10 text-green-300 px-2 py-0.5 rounded-md border border-green-500/20">
              {data.winRate}% Win
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.winCount}</p>
            <span className="text-xs text-green-400 font-mono font-bold">
              +${data.totalHedgeWinsPnl}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Coberturas donde la gestión generó ganancia neta.
          </p>
        </div>

        {/* 3. COBERTURAS PERDIDAS */}
        <div className="bg-[#0b0e11] p-4 rounded-xl border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle size={14} /> Coberturas Perdidas
            </span>
            <span className="text-[11px] font-mono font-bold bg-red-500/10 text-red-300 px-2 py-0.5 rounded-md border border-red-500/20">
              {data.lossRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.lossCount}</p>
            <span className="text-xs text-red-400 font-mono font-bold">
              -${data.totalHedgeLossesPnl}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Coberturas que resultaron en pérdida controlada.
          </p>
        </div>

        {/* 4. COBERTURAS A BREAKEVEN */}
        <div className="bg-[#0b0e11] p-4 rounded-xl border border-yellow-500/20 relative overflow-hidden group hover:border-yellow-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <MinusCircle size={14} /> A Break Even (BE)
            </span>
            <span className="text-[11px] font-mono font-bold bg-yellow-500/10 text-yellow-300 px-2 py-0.5 rounded-md border border-yellow-500/20">
              {data.breakevenRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.breakevenCount}</p>
            <span className="text-xs text-gray-500 font-mono">$0.00</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Coberturas cerradas en punto de equilibrio sin pérdidas.
          </p>
        </div>

      </div>

      {/* Banner de Coberturas en Gestión Activa */}
      {data.managingCount && data.managingCount > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Clock size={16} className="animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                {data.managingCount} {data.managingCount === 1 ? 'Cobertura en Gestión Activa' : 'Coberturas en Gestión Activa'}
              </p>
              <p className="text-[11px] text-gray-300">
                El saldo de tu cuenta tiene descontados <span className="text-red-400 font-mono font-bold">-${data.totalManagingFrozenLoss || '0.00'}</span> congelados temporalmente.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/30">
            {data.managingRate}% de operaciones en gestión
          </span>
        </div>
      ) : null}

      {/* Barra de Distribución Visual y Balance Neto */}
      <div className="bg-[#10141a] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Barra de Distribución */}
        <div className="w-full md:flex-1 space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span className="font-semibold text-white">Distribución de Coberturas</span>
            <span className="text-[11px] text-gray-500">
              {data.triggeredCount} activadas ({data.triggeredRate}%) vs {data.notTriggeredCount} sin activar
            </span>
          </div>

          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
            {/* Sin Cobertura */}
            <div 
              style={{ width: `${data.notTriggeredRate}%` }} 
              className="bg-blue-500 transition-all" 
              title={`Sin Cobertura: ${data.notTriggeredCount} (${data.notTriggeredRate}%)`} 
            />
            {/* En Gestión */}
            {data.managingCount && data.managingCount > 0 ? (
              <div 
                style={{ width: `${(data.managingCount / data.totalHedgeTrades) * 100}%` }} 
                className="bg-amber-500 transition-all" 
                title={`En Gestión: ${data.managingCount}`} 
              />
            ) : null}
            {/* Ganadas */}
            <div 
              style={{ width: `${(data.winCount / data.totalHedgeTrades) * 100}%` }} 
              className="bg-[#00FF7F] transition-all" 
              title={`Ganadas: ${data.winCount}`} 
            />
            {/* Break Even */}
            <div 
              style={{ width: `${(data.breakevenCount / data.totalHedgeTrades) * 100}%` }} 
              className="bg-yellow-400 transition-all" 
              title={`Break Even: ${data.breakevenCount}`} 
            />
            {/* Perdidas */}
            <div 
              style={{ width: `${(data.lossCount / data.totalHedgeTrades) * 100}%` }} 
              className="bg-red-500 transition-all" 
              title={`Perdidas: ${data.lossCount}`} 
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Sin Cobertura ({data.notTriggeredCount})</span>
            </div>
            {data.managingCount && data.managingCount > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>En Gestión ({data.managingCount})</span>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF7F]"></span>
              <span>Ganadas ({data.winCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span>Break Even ({data.breakevenCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Perdidas ({data.lossCount})</span>
            </div>
          </div>
        </div>

        {/* PnL Neto de Coberturas */}
        <div className="w-full md:w-auto min-w-[200px] bg-[#0b0e11] p-3 rounded-xl border border-gray-800 flex flex-col items-center md:items-end justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PnL Neto de Coberturas</span>
          <span className={`text-2xl font-mono font-bold ${netPnlColor}`}>
            {netPnlNum > 0 ? '+' : ''}${data.totalHedgePnl}
          </span>
          <span className="text-[10px] text-gray-500">Impacto sumado al journal</span>
        </div>

      </div>

    </div>
  );
}
