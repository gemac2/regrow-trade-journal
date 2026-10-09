// app/(main)/trades/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useAccount } from '@/app/context/AccountContext';
import { getTrades, deleteTrade, getStats, getHedgeStats } from '@/app/actions';
import { exportStatisticsCSV, exportStatisticsExcel } from '@/app/lib/exportCsv';
import { TradeModal } from '@/components/TradeModal';
import { DeleteTradeModal } from '@/components/DeleteTradeModal';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Pencil, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Clock,
  Download,
  FileSpreadsheet,
  Layers,
  X,
  ArrowUpDown
} from 'lucide-react';

function formatTradeDuration(entryDateStr: string | Date, exitDateStr?: string | Date | null) {
  if (!entryDateStr) return { text: '-', isOpen: false };
  const start = new Date(entryDateStr).getTime();
  if (isNaN(start)) return { text: '-', isOpen: false };

  const isClosed = Boolean(exitDateStr);
  const end = isClosed ? new Date(exitDateStr!).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    text = `${minutes}m`;
  } else {
    text = '< 1m';
  }

  return { text, isOpen: !isClosed };
}

function getHedgeStatusBadge(trade: any) {
  if (!trade.isHedge || !trade.hedgeTriggered || trade.hedgeStatus === 'NOT_TRIGGERED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60 whitespace-nowrap">
        Sin cobertura
      </span>
    );
  }
  if (trade.hedgeStatus === 'WIN') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 whitespace-nowrap">
        Ganada
      </span>
    );
  }
  if (trade.hedgeStatus === 'LOSS') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap">
        Perdida
      </span>
    );
  }
  if (trade.hedgeStatus === 'BREAKEVEN') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
        Breakeven
      </span>
    );
  }
  if (trade.hedgeStatus === 'MANAGING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse whitespace-nowrap">
        <Clock size={10} className="animate-spin text-amber-400" />
        En gestión
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60 whitespace-nowrap">
      Sin cobertura
    </span>
  );
}

function getTradeRiskMetrics(trade: any, initialBalanceStr?: string) {
  const initialBalance = initialBalanceStr ? parseFloat(initialBalanceStr) : 0;
  
  // 1. Riesgo Inicial en %
  let initPct = '-';
  if (trade.riskPercentage && !isNaN(parseFloat(trade.riskPercentage))) {
    initPct = `${parseFloat(trade.riskPercentage).toFixed(2)}%`;
  } else if (trade.stopLoss && trade.entryPrice && trade.size && initialBalance > 0) {
    const autoRisk = Math.abs(parseFloat(trade.entryPrice) - parseFloat(trade.stopLoss)) * parseFloat(trade.size);
    if (!isNaN(autoRisk) && autoRisk > 0) {
      initPct = `${((autoRisk / initialBalance) * 100).toFixed(2)}%`;
    }
  }

  // 2. Riesgo Inicial en $
  let initDollar = '-';
  if (trade.riskAmount && !isNaN(parseFloat(trade.riskAmount))) {
    initDollar = `$${parseFloat(trade.riskAmount).toFixed(2)}`;
  } else if (trade.stopLoss && trade.entryPrice && trade.size) {
    const autoRisk = Math.abs(parseFloat(trade.entryPrice) - parseFloat(trade.stopLoss)) * parseFloat(trade.size);
    if (!isNaN(autoRisk) && autoRisk > 0) {
      initDollar = `$${autoRisk.toFixed(2)}`;
    }
  }

  // 3. Riesgo Final en % y $
  let finalPct = '-';
  let finalDollar = '-';
  let finalPctColor = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
  let finalDollarColor = 'bg-slate-800/80 text-slate-400 border-slate-700/60';

  if (trade.isHedge) {
    if (trade.hedgeTriggered && trade.hedgeStatus === 'WIN') {
      finalPct = '0.00%';
      finalDollar = trade.hedgePnl && Number(trade.hedgePnl) > 0 
        ? `+$${Number(trade.hedgePnl).toFixed(2)}` 
        : '$0.00';
      finalPctColor = 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30';
      finalDollarColor = 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30';
    } else if (trade.hedgeTriggered && trade.hedgeStatus === 'BREAKEVEN') {
      finalPct = '0.00%';
      finalDollar = '$0.00';
      finalPctColor = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      finalDollarColor = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    } else if (trade.hedgeTriggered && trade.hedgeStatus === 'LOSS') {
      let lostPctVal = 0;
      if (trade.hedgePnlPercent && !isNaN(parseFloat(trade.hedgePnlPercent))) {
        lostPctVal = Math.abs(parseFloat(trade.hedgePnlPercent));
      } else if (trade.hedgePnl && trade.riskAmount && trade.riskPercentage && parseFloat(trade.riskAmount) > 0) {
        lostPctVal = (Math.abs(parseFloat(trade.hedgePnl)) / parseFloat(trade.riskAmount)) * parseFloat(trade.riskPercentage);
      } else if (trade.riskPercentage) {
        lostPctVal = parseFloat(trade.riskPercentage);
      }
      finalPct = `-${lostPctVal.toFixed(2)}%`;
      
      const lostDollarVal = trade.hedgePnl 
        ? Math.abs(parseFloat(trade.hedgePnl)) 
        : (trade.riskAmount ? Math.abs(parseFloat(trade.riskAmount)) : 0);
      finalDollar = `-$${lostDollarVal.toFixed(2)}`;

      finalPctColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      finalDollarColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    } else if (trade.hedgeTriggered && trade.hedgeStatus === 'MANAGING') {
      finalPct = trade.riskPercentage ? `-${parseFloat(trade.riskPercentage).toFixed(2)}%` : '-';
      const fl = trade.frozenLoss ? parseFloat(trade.frozenLoss) : (trade.riskAmount ? parseFloat(trade.riskAmount) : 0);
      finalDollar = fl > 0 ? `-$${fl.toFixed(2)}` : '-';
      finalPctColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      finalDollarColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    } else {
      // Cobertura no activada
      if (trade.pnl !== null && trade.pnl !== undefined) {
        const pnlNum = parseFloat(trade.pnl);
        if (pnlNum >= 0) {
          finalPct = '0.00%';
          finalDollar = '$0.00';
          finalPctColor = 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30';
          finalDollarColor = 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30';
        } else {
          const lossDollar = Math.abs(pnlNum);
          finalDollar = `-$${lossDollar.toFixed(2)}`;
          if (initialBalance > 0) {
            finalPct = `-${((lossDollar / initialBalance) * 100).toFixed(2)}%`;
          } else if (trade.riskPercentage) {
            finalPct = `-${parseFloat(trade.riskPercentage).toFixed(2)}%`;
          } else {
            finalPct = '-';
          }
          finalPctColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
          finalDollarColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
        }
      }
    }
  } else {
    // Operación normal (sin cobertura)
    if (trade.pnl !== null && trade.pnl !== undefined) {
      const pnlNum = parseFloat(trade.pnl);
      if (pnlNum >= 0) {
        finalPct = '0.00%';
        finalDollar = '$0.00';
        finalPctColor = 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30';
        finalDollarColor = 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30';
      } else {
        const lossDollar = Math.abs(pnlNum);
        finalDollar = `-$${lossDollar.toFixed(2)}`;
        if (initialBalance > 0) {
          finalPct = `-${((lossDollar / initialBalance) * 100).toFixed(2)}%`;
        } else if (trade.riskPercentage) {
          finalPct = `-${parseFloat(trade.riskPercentage).toFixed(2)}%`;
        } else {
          finalPct = '-';
        }
        finalPctColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
        finalDollarColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      }
    }
  }

  return {
    initPct,
    initDollar,
    finalPct,
    finalDollar,
    finalPctColor,
    finalDollarColor,
  };
}

export default function TradesPage() {
  const { user } = useAuth();
  const { selectedAccount, isLoading: isAccountLoading, refreshCurrentBalance } = useAccount();
  
  const [trades, setTrades] = useState<any[]>([]);
  
  // --- STATES FOR MODALS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<any>(null);
  
  // States for Delete Modal
  const [tradeToDelete, setTradeToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user && selectedAccount) {
      loadTrades(user.id, selectedAccount.id);
    }
  }, [user, selectedAccount]);

  async function loadTrades(userId: string, accountId: number) {
    setLoadingData(true);
    const { success, data } = await getTrades(userId, accountId);
    if (success && data) setTrades(data);
    else setTrades([]);
    setLoadingData(false);
  }

  // --- DELETE LOGIC ---
  function requestDelete(id: number) {
    setTradeToDelete(id);
  }

  async function confirmDelete() {
    if (!tradeToDelete || !user || !selectedAccount) return;
    
    setIsDeleting(true);
    await deleteTrade(tradeToDelete);
    await Promise.all([
      loadTrades(user.id, selectedAccount.id),
      refreshCurrentBalance()
    ]);
    setIsDeleting(false);
    setTradeToDelete(null);
  }

  function handleEdit(trade: any) {
    setTradeToEdit(trade);
    setIsModalOpen(true);
  }

  function handleCreate() {
    setTradeToEdit(null);
    setIsModalOpen(true);
  }

  // --- EXPORT LOGIC ---
  async function handleDownloadExcel() {
    if (!user || !selectedAccount || isExporting) return;
    setIsExporting(true);
    try {
      const [statsRes, hedgeRes] = await Promise.all([
        getStats(user.id, selectedAccount.id),
        getHedgeStats(user.id, selectedAccount.id)
      ]);
      await exportStatisticsExcel({
        accountName: selectedAccount.name,
        stats: statsRes.success ? (statsRes.data as any) : null,
        hedgeData: hedgeRes.success ? (hedgeRes.data as any) : null,
        trades: trades
      });
    } catch (err) {
      console.error("Error exporting Excel:", err);
      exportStatisticsCSV({
        accountName: selectedAccount.name,
        trades: trades
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownloadCSV() {
    if (!user || !selectedAccount || isExporting) return;
    setIsExporting(true);
    try {
      const [statsRes, hedgeRes] = await Promise.all([
        getStats(user.id, selectedAccount.id),
        getHedgeStats(user.id, selectedAccount.id)
      ]);
      exportStatisticsCSV({
        accountName: selectedAccount.name,
        stats: statsRes.success ? (statsRes.data as any) : null,
        hedgeData: hedgeRes.success ? (hedgeRes.data as any) : null,
        trades: trades
      });
    } catch (err) {
      console.error("Error exporting CSV:", err);
      exportStatisticsCSV({
        accountName: selectedAccount.name,
        trades: trades
      });
    } finally {
      setIsExporting(false);
    }
  }

  // Filtering Logic
  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'LONG') matchesType = trade.type === 'LONG';
    else if (filterType === 'SHORT') matchesType = trade.type === 'SHORT';
    else if (filterType === 'HEDGE') matchesType = Boolean(trade.isHedge);
    else if (filterType === 'HEDGE_MANAGING') matchesType = Boolean(trade.isHedge) && Boolean(trade.hedgeTriggered) && trade.hedgeStatus === 'MANAGING';
    else if (filterType === 'HEDGE_NO_TRIGGER') matchesType = Boolean(trade.isHedge) && (!trade.hedgeTriggered || trade.hedgeStatus === 'NOT_TRIGGERED');
    else if (filterType === 'HEDGE_WIN') matchesType = Boolean(trade.isHedge) && trade.hedgeStatus === 'WIN';
    else if (filterType === 'HEDGE_LOSS') matchesType = Boolean(trade.isHedge) && trade.hedgeStatus === 'LOSS';
    else if (filterType === 'HEDGE_BE') matchesType = Boolean(trade.isHedge) && trade.hedgeStatus === 'BREAKEVEN';

    return matchesSearch && matchesType;
  });

  // Totales para métricas rápidas
  const totalHedgeCount = trades.filter(t => t.isHedge).length;
  const managingHedgeCount = trades.filter(t => t.isHedge && t.hedgeTriggered && t.hedgeStatus === 'MANAGING').length;
  const noHedgeCount = trades.filter(t => t.isHedge && (!t.hedgeTriggered || t.hedgeStatus === 'NOT_TRIGGERED')).length;
  const winHedgeCount = trades.filter(t => t.isHedge && t.hedgeStatus === 'WIN').length;
  const lossHedgeCount = trades.filter(t => t.isHedge && t.hedgeStatus === 'LOSS').length;
  const beHedgeCount = trades.filter(t => t.isHedge && t.hedgeStatus === 'BREAKEVEN').length;

  const longsCount = trades.filter(t => t.type === 'LONG').length;
  const shortsCount = trades.filter(t => t.type === 'SHORT').length;

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrades = filteredTrades.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  if (isAccountLoading || !selectedAccount) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#00E599]" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* --- HEADER CON ACCIONES --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#121824] via-[#161D2B] to-[#121824] p-6 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
              Libro Diario
            </span>
            <span className="text-xs text-slate-400">Total: {trades.length} operaciones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Bitácora de Operaciones <span className="text-slate-500 text-lg font-normal">({selectedAccount.name})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Registro cronológico detallado, gestión de cobertura y análisis de ejecuciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="bg-gradient-to-r from-blue-700 to-[#00A3FF] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-[#00A3FF]/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-blue-950/40"
            title="Descargar reporte completo en Excel (.xlsx)"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin text-white" /> : <FileSpreadsheet size={16} className="text-[#00E599]" />}
            <span>{isExporting ? 'Generando...' : 'Descargar Excel'}</span>
          </button>

          <button 
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className="bg-[#0D1117] hover:bg-[#182030] text-slate-300 hover:text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-white/[0.08] hover:border-white/[0.15] transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
            title="Descargar formato CSV plano"
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:brightness-105 transition shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_25px_rgba(0,229,153,0.45)] cursor-pointer"
          >
            <Plus size={18} className="stroke-[2.5]" /> 
            <span>Nuevo Trade</span>
          </button>
        </div>
      </div>

      {/* --- QUICK STATS RIBBON --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121824] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Operaciones:</span>
          <span className="text-sm font-bold font-mono text-white">{trades.length}</span>
        </div>
        <div className="bg-[#121824] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Longs / Shorts:</span>
          <span className="text-xs font-mono font-bold text-slate-300">
            <span className="text-[#00E599]">{longsCount}L</span> / <span className="text-rose-400">{shortsCount}S</span>
          </span>
        </div>
        <div className="bg-[#121824] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Modo Cobertura:</span>
          <span className="text-sm font-bold font-mono text-[#00A3FF]">{totalHedgeCount}</span>
        </div>
        <div className="bg-[#121824] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">En Gestión:</span>
          <span className={`text-sm font-bold font-mono ${managingHedgeCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {managingHedgeCount}
          </span>
        </div>
      </div>

      {/* --- HEDGE QUICK FILTER RIBBON --- */}
      {totalHedgeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#121824] rounded-2xl border border-white/[0.08] text-xs">
          <span className="text-slate-400 font-semibold px-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00A3FF]"></span>
            Filtros Hedge:
          </span>
          <button
            onClick={() => setFilterType('HEDGE')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'HEDGE' ? 'bg-[#00A3FF] text-slate-950 font-bold' : 'bg-[#0D1117] text-slate-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            Total Hedge ({totalHedgeCount})
          </button>
          <button
            onClick={() => setFilterType('HEDGE_MANAGING')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'HEDGE_MANAGING' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-[#0D1117] text-amber-400 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <Clock size={12} className={filterType === 'HEDGE_MANAGING' ? 'animate-spin' : ''} />
            Gestionando ({managingHedgeCount})
          </button>
          <button
            onClick={() => setFilterType('HEDGE_NO_TRIGGER')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'HEDGE_NO_TRIGGER' ? 'bg-blue-500 text-white font-bold' : 'bg-[#0D1117] text-blue-400 hover:bg-blue-500/10 border border-blue-500/30'
            }`}
          >
            🛡️ Sin Cobertura ({noHedgeCount})
          </button>
          <button
            onClick={() => setFilterType('HEDGE_WIN')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'HEDGE_WIN' ? 'bg-[#00E599] text-slate-950 font-bold' : 'bg-[#0D1117] text-[#00E599] hover:bg-emerald-500/10 border border-emerald-500/30'
            }`}
          >
            ✅ Ganadas ({winHedgeCount})
          </button>
          <button
            onClick={() => setFilterType('HEDGE_LOSS')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'HEDGE_LOSS' ? 'bg-rose-500 text-white font-bold' : 'bg-[#0D1117] text-rose-400 hover:bg-rose-500/10 border border-rose-500/30'
            }`}
          >
            ❌ Perdidas ({lossHedgeCount})
          </button>
          <button
            onClick={() => setFilterType('HEDGE_BE')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterType === 'HEDGE_BE' ? 'bg-yellow-400 text-slate-950 font-bold' : 'bg-[#0D1117] text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/30'
            }`}
          >
            ⚖️ Breakeven ({beHedgeCount})
          </button>
          {filterType.startsWith('HEDGE') && (
            <button
              onClick={() => setFilterType('ALL')}
              className="ml-auto text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Resetear filtro
            </button>
          )}
        </div>
      )}

      {/* --- CONTROLS BAR (SEARCH + FILTER TOGGLE) --- */}
      <div className="bg-[#121824] p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input 
            type="text" 
            placeholder="Buscar por símbolo o estrategia (ej. BTC, Scalping)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00E599] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white outline-none transition-colors placeholder:text-slate-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative min-w-[210px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00E599] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">Todas las Operaciones</option>
            <option value="LONG">Solo LONGs</option>
            <option value="SHORT">Solo SHORTs</option>
            <option value="HEDGE">Modo Cobertura (Todos)</option>
            <option value="HEDGE_MANAGING">Cobertura: En Gestión ({managingHedgeCount})</option>
            <option value="HEDGE_NO_TRIGGER">Cobertura: Sin Activar</option>
            <option value="HEDGE_WIN">Cobertura: Ganadas</option>
            <option value="HEDGE_LOSS">Cobertura: Perdidas</option>
            <option value="HEDGE_BE">Cobertura: Breakeven</option>
          </select>
        </div>
      </div>

      {/* --- TABLE CARD --- */}
      <div className="bg-[#121824] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0D1117] text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Activo</th>
                <th className="px-4 py-4">Dirección</th>
                <th className="px-4 py-4 text-right">Entrada</th>
                <th className="px-4 py-4 text-right">Tamaño</th>
                <th className="px-4 py-4 text-right">Salida</th>
                <th className="px-4 py-4">Estrategia</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Riesgo</th>
                <th className="px-4 py-4 text-right">PnL Neto</th>
                <th className="px-4 py-4">Duración</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loadingData ? (
                <tr>
                  <td colSpan={12} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#00E599]" size={28} />
                      <span className="text-xs font-mono">Cargando operaciones...</span>
                    </div>
                  </td>
                </tr>
              ) : currentTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400">
                        <Layers size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        {searchTerm || filterType !== 'ALL' 
                          ? 'No hay operaciones que coincidan con tus filtros.' 
                          : 'Aún no hay operaciones registradas en esta cuenta.'}
                      </p>
                      <button
                        onClick={handleCreate}
                        className="text-xs font-bold bg-[#00E599]/15 text-[#00E599] hover:bg-[#00E599]/25 px-4 py-2 rounded-xl border border-[#00E599]/30 transition cursor-pointer"
                      >
                        + Registrar Primera Operación
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTrades.map((trade) => {
                  const isLong = trade.type === 'LONG';
                  const isManaging = trade.hedgeStatus === 'MANAGING' && trade.isHedge && trade.hedgeTriggered;
                  const risk = getTradeRiskMetrics(trade, selectedAccount?.initialBalance);
                  const duration = formatTradeDuration(trade.entryDate, trade.exitDate);

                  return (
                    <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      {/* 1. Fecha */}
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-mono whitespace-nowrap">
                        {new Date(trade.entryDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* 2. Activo */}
                      <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                        <span className="font-mono tracking-tight text-white">{trade.symbol}</span>
                      </td>

                      {/* 3. Dirección (LONG/SHORT) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isLong 
                            ? 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30' 
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isLong ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                          {trade.type}
                        </span>
                      </td>

                      {/* 4. Entrada */}
                      <td className="px-4 py-3.5 font-mono text-right text-slate-200 whitespace-nowrap">
                        ${Number(trade.entryPrice).toFixed(4)}
                      </td>

                      {/* 5. Tamaño */}
                      <td className="px-4 py-3.5 font-mono text-right text-slate-300 whitespace-nowrap">
                        {Number(trade.size).toFixed(3)}
                      </td>

                      {/* 6. Salida */}
                      <td className="px-4 py-3.5 font-mono text-right text-slate-300 whitespace-nowrap">
                        {trade.exitPrice ? `$${Number(trade.exitPrice).toFixed(4)}` : (
                          <span className="text-slate-500 text-xs italic">Abierta</span>
                        )}
                      </td>

                      {/* 7. Estrategia */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {trade.strategy ? (
                            <span className="bg-[#0D1117] text-slate-300 px-2.5 py-0.5 rounded-lg text-xs border border-white/[0.06] font-medium">
                              {trade.strategy}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}

                          {trade.isHedge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
                              Cobertura
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. Estado */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getHedgeStatusBadge(trade)}
                      </td>

                      {/* 9. Riesgo (4 Badges) */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 min-w-[135px]">
                          <div className="flex items-center gap-1">
                            <span 
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                              title="Riesgo Inicial (%)"
                            >
                              <span className="text-slate-500 mr-1 text-[9px] font-sans font-bold">Ini %</span>
                              {risk.initPct}
                            </span>
                            <span 
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                              title="Riesgo Inicial ($)"
                            >
                              <span className="text-slate-500 mr-1 text-[9px] font-sans font-bold">Ini $</span>
                              {risk.initDollar}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span 
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${risk.finalPctColor}`}
                              title="Riesgo Final (%)"
                            >
                              <span className="opacity-70 mr-1 text-[9px] font-sans font-bold">Fin %</span>
                              {risk.finalPct}
                            </span>
                            <span 
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${risk.finalDollarColor}`}
                              title="Riesgo Final ($)"
                            >
                              <span className="opacity-70 mr-1 text-[9px] font-sans font-bold">Fin $</span>
                              {risk.finalDollar}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 10. PnL Neto */}
                      <td className="px-4 py-3.5 font-mono font-bold text-right whitespace-nowrap">
                        {isManaging ? (
                          <div className="flex flex-col items-end">
                            <span className="text-amber-400 font-bold">
                              -${trade.frozenLoss && !isNaN(Number(trade.frozenLoss))
                                ? Number(trade.frozenLoss).toFixed(2)
                                : '0.00'}
                            </span>
                            <span className="text-[10px] font-sans font-normal text-amber-400/80">Flotante</span>
                          </div>
                        ) : trade.pnl !== null && trade.pnl !== undefined ? (
                          <span className={Number(trade.pnl) > 0 ? 'text-[#00E599]' : Number(trade.pnl) < 0 ? 'text-rose-400' : 'text-slate-400'}>
                            {Number(trade.pnl) > 0 ? '+' : ''}${Number(trade.pnl).toFixed(2)}
                          </span>
                        ) : (trade.isHedge && trade.hedgeTriggered && ['WIN', 'LOSS', 'BREAKEVEN'].includes(trade.hedgeStatus) && trade.hedgePnl) ? (
                          <span className={Number(trade.hedgePnl) > 0 ? 'text-[#00E599]' : Number(trade.hedgePnl) < 0 ? 'text-rose-400' : 'text-slate-400'}>
                            {Number(trade.hedgePnl) > 0 ? '+' : ''}${Number(trade.hedgePnl).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-sans">EN CURSO</span>
                        )}
                      </td>

                      {/* 11. Duración */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className={duration.isOpen ? "text-amber-400" : "text-slate-400"} />
                          <span className={`text-xs font-mono font-medium ${duration.isOpen ? "text-amber-300" : "text-slate-300"}`}>
                            {duration.text}
                          </span>
                          {duration.isOpen && (
                            <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Activo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 12. Acciones */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handleEdit(trade)}
                            className="p-1.5 text-slate-400 hover:text-[#00A3FF] hover:bg-white/[0.06] rounded-lg transition cursor-pointer"
                            title="Editar / Cerrar Trade"
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            onClick={() => requestDelete(trade.id)} 
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                            title="Eliminar Operación"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-[#0D1117] border-t border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTrades.length)} de {filteredTrades.length} registros
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#121824] border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-xs font-mono text-slate-400">
                Página <span className="text-white font-bold">{currentPage}</span> de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-[#121824] border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {user && selectedAccount && (
        <>
          <TradeModal 
            userId={user.id}
            accountId={selectedAccount.id}
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); loadTrades(user.id, selectedAccount.id); }} 
            tradeToEdit={tradeToEdit} 
          />
          
          <DeleteTradeModal 
            isOpen={tradeToDelete !== null}
            onClose={() => setTradeToDelete(null)}
            onConfirm={confirmDelete}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
}