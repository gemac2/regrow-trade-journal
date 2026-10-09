// components/HedgeAnalytics.tsx
'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Download, 
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { getTrades } from '@/app/actions';
import { exportStatisticsCSV, exportStatisticsExcel, TradeExportItem } from '@/app/lib/exportCsv';

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
  initialAvgRiskPercent?: string;
}

interface HedgeAnalyticsProps {
  data: HedgeData | null;
  loading?: boolean;
  accountName?: string;
  userId?: string;
  accountId?: number;
  stats?: {
    netPnL: string;
    winRate: string;
    profitFactor: string;
    totalTrades: number;
    currentBalance: string;
    initialBalance: string;
  } | null;
}

export function HedgeAnalytics({ 
  data, 
  loading, 
  accountName = 'Cuenta Principal', 
  userId, 
  accountId, 
  stats 
}: HedgeAnalyticsProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleDownloadExcel() {
    if (!data || isExporting) return;
    setIsExporting(true);
    try {
      let tradesList: TradeExportItem[] = [];
      if (userId && accountId) {
        const res = await getTrades(userId, accountId);
        if (res.success && res.data) {
          tradesList = res.data;
        }
      }
      await exportStatisticsExcel({
        accountName,
        stats: stats || null,
        hedgeData: data,
        trades: tradesList
      });
    } catch (err) {
      console.error('Error exporting Excel from HedgeAnalytics:', err);
      exportStatisticsCSV({
        accountName,
        stats: stats || null,
        hedgeData: data,
        trades: []
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownloadCSV() {
    if (!data || isExporting) return;
    setIsExporting(true);
    try {
      let tradesList: TradeExportItem[] = [];
      if (userId && accountId) {
        const res = await getTrades(userId, accountId);
        if (res.success && res.data) {
          tradesList = res.data;
        }
      }
      exportStatisticsCSV({
        accountName,
        stats: stats || null,
        hedgeData: data,
        trades: tradesList
      });
    } catch (err) {
      console.error('Error exporting CSV from HedgeAnalytics:', err);
      exportStatisticsCSV({
        accountName,
        stats: stats || null,
        hedgeData: data,
        trades: []
      });
    } finally {
      setIsExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#121824] p-6 rounded-2xl border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data || data.totalHedgeTrades === 0) {
    return (
      <div className="bg-[#121824] p-8 rounded-2xl border border-white/[0.08] text-center space-y-3 shadow-xl">
        <div className="inline-flex p-3 rounded-2xl bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20 shadow-inner">
          <Layers size={28} />
        </div>
        <h3 className="text-lg font-bold text-white">Sistema de Coberturas (Hedge Risk Desk)</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Aún no tienes operaciones registradas con <span className="text-[#00A3FF] font-semibold">Modo Hedge</span> activado. 
          Al registrar o editar operaciones activando el interruptor de cobertura, este módulo calculará la reducción de riesgo real y la efectividad de tus órdenes de protección.
        </p>
      </div>
    );
  }

  const netPnlNum = parseFloat(data.totalHedgePnl);
  const netPnlColor = netPnlNum > 0 ? 'text-[#00E599]' : netPnlNum < 0 ? 'text-rose-400' : 'text-slate-400';

  return (
    <div className="bg-[#121824] p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#00A3FF]/20 to-[#00E599]/20 text-[#00A3FF] rounded-xl border border-[#00A3FF]/30">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Hedge Risk Desk</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
                Coberturas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Control cuantitativo de efectividad, contención de riesgo y PnL de coberturas
            </p>
          </div>
        </div>

        {/* Action Badges & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#0D1117] px-3 py-1.5 rounded-xl border border-white/[0.08] flex items-center gap-2">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Hedge:</span>
            <span className="text-xs font-bold text-white font-mono">{data.totalHedgeTrades} ops</span>
          </div>

          <div 
            className="bg-[#0D1117] px-3 py-1.5 rounded-xl border border-white/[0.08] flex flex-col justify-center"
            title={data.initialAvgRiskPercent ? `Riesgo inicial: ${data.initialAvgRiskPercent}% | Riesgo efectivo tras cobertura: ${data.avgRiskPercent}%` : undefined}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Riesgo Real:</span>
              <span className="text-xs font-bold text-[#00A3FF] font-mono">{data.avgRiskPercent}%</span>
            </div>
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="bg-gradient-to-r from-blue-700 to-[#00A3FF] hover:brightness-110 text-white px-3.5 py-1.5 rounded-xl border border-[#00A3FF]/40 transition flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-blue-950/40"
            title="Descargar informe completo en Excel (.xlsx)"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin text-white" /> : <FileSpreadsheet size={14} className="text-[#00E599]" />}
            <span>{isExporting ? 'Exportando...' : 'Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className="bg-[#0D1117] hover:bg-[#182030] text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition flex items-center gap-1.5 text-xs font-medium cursor-pointer disabled:opacity-50"
            title="Descargar CSV plano"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 4 PIPELINE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. NO TOCARON COBERTURA */}
        <div className="bg-[#0D1117] p-4 rounded-xl border border-blue-500/25 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={15} /> Sin Cobertura
            </span>
            <span className="text-[11px] font-mono font-bold bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/30">
              {data.notTriggeredRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.notTriggeredCount}</p>
            <span className="text-xs text-slate-500 font-mono">de {data.totalHedgeTrades} ops</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-tight">
            Operaciones directas al take profit sin requerir activar la cobertura.
          </p>
        </div>

        {/* 2. COBERTURAS GANADAS */}
        <div className="bg-[#0D1117] p-4 rounded-xl border border-[#00E599]/25 relative overflow-hidden group hover:border-[#00E599]/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#00E599] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Coberturas Ganadas
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#00E599]/15 text-[#00E599] px-2 py-0.5 rounded-md border border-[#00E599]/30">
              {data.winRate}% Win
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.winCount}</p>
            <span className="text-xs text-[#00E599] font-mono font-bold">
              +${data.totalHedgeWinsPnl}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-tight">
            Coberturas donde la gestión revirtió la posición y cerró con beneficio neto.
          </p>
        </div>

        {/* 3. COBERTURAS PERDIDAS */}
        <div className="bg-[#0D1117] p-4 rounded-xl border border-rose-500/25 relative overflow-hidden group hover:border-rose-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle size={15} /> Coberturas Perdidas
            </span>
            <span className="text-[11px] font-mono font-bold bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/30">
              {data.lossRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.lossCount}</p>
            <span className="text-xs text-rose-400 font-mono font-bold">
              -${data.totalHedgeLossesPnl}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-tight">
            Coberturas que concluyeron en pérdida contenida y cuantificada.
          </p>
        </div>

        {/* 4. COBERTURAS BREAKEVEN */}
        <div className="bg-[#0D1117] p-4 rounded-xl border border-yellow-500/25 relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <MinusCircle size={15} /> En Breakeven (BE)
            </span>
            <span className="text-[11px] font-mono font-bold bg-yellow-500/15 text-yellow-300 px-2 py-0.5 rounded-md border border-yellow-500/30">
              {data.breakevenRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-mono font-bold text-white">{data.breakevenCount}</p>
            <span className="text-xs text-slate-400 font-mono">$0.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-tight">
            Coberturas cerradas en equilibrio exacto (cero pérdida y cero ganancia).
          </p>
        </div>

      </div>

      {/* CALLOUT: COBERTURAS EN GESTIÓN ACTIVA */}
      {data.managingCount && data.managingCount > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Clock size={18} className="animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                {data.managingCount} {data.managingCount === 1 ? 'Cobertura en Gestión Activa' : 'Coberturas en Gestión Activa'}
              </p>
              <p className="text-xs text-slate-300">
                El saldo de tu cuenta tiene <span className="text-rose-400 font-mono font-bold">-${data.totalManagingFrozenLoss || '0.00'}</span> descontados preventivamente como flotante pendiente.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/40">
            {data.managingRate}% en gestión activa
          </span>
        </div>
      ) : null}

      {/* SEGMENTED PROGRESS BAR & NET HEDGE PNL */}
      <div className="bg-[#0D1117] p-5 rounded-xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Barra de Distribución */}
        <div className="w-full md:flex-1 space-y-2.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">Pipeline de Coberturas</span>
            <span className="text-[11px] text-slate-400">
              {data.triggeredCount} activadas ({data.triggeredRate}%) vs {data.notTriggeredCount} sin activar
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${data.notTriggeredRate}%` }} 
              className="bg-blue-500 transition-all duration-500" 
              title={`Sin Cobertura: ${data.notTriggeredCount} (${data.notTriggeredRate}%)`} 
            />
            {data.managingCount && data.managingCount > 0 ? (
              <div 
                style={{ width: `${(data.managingCount / data.totalHedgeTrades) * 100}%` }} 
                className="bg-amber-500 transition-all duration-500" 
                title={`En Gestión: ${data.managingCount}`} 
              />
            ) : null}
            <div 
              style={{ width: `${(data.winCount / data.totalHedgeTrades) * 100}%` }} 
              className="bg-[#00E599] transition-all duration-500" 
              title={`Ganadas: ${data.winCount}`} 
            />
            <div 
              style={{ width: `${(data.breakevenCount / data.totalHedgeTrades) * 100}%` }} 
              className="bg-yellow-400 transition-all duration-500" 
              title={`Break Even: ${data.breakevenCount}`} 
            />
            <div 
              style={{ width: `${(data.lossCount / data.totalHedgeTrades) * 100}%` }} 
              className="bg-rose-500 transition-all duration-500" 
              title={`Perdidas: ${data.lossCount}`} 
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599]"></span>
              <span>Ganadas ({data.winCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span>BE ({data.breakevenCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Perdidas ({data.lossCount})</span>
            </div>
          </div>
        </div>

        {/* PnL Neto de Coberturas */}
        <div className="w-full md:w-auto min-w-[220px] bg-[#121824] p-4 rounded-xl border border-white/[0.08] flex flex-col items-center md:items-end justify-center shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PnL Neto de Coberturas</span>
          <span className={`text-2xl font-mono font-bold ${netPnlColor}`}>
            {netPnlNum > 0 ? '+' : ''}${data.totalHedgePnl}
          </span>
          <span className="text-[10px] text-slate-400">Resultado neto consolidado</span>
        </div>

      </div>

    </div>
  );
}
