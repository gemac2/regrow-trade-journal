// components/TradeModal.tsx
'use client';

import { useState } from 'react';
import { createTrade, updateTrade } from '@/app/actions';
import { useAccount } from '@/app/context/AccountContext';
import { X, Loader2, ShieldCheck, Clock, Layers, Lock, TrendingUp, TrendingDown } from 'lucide-react';

export interface TradeRecord {
  id?: number | string;
  symbol?: string;
  type?: string;
  strategy?: string | null;
  entryPrice?: string | number | null;
  exitPrice?: string | number | null;
  size?: string | number | null;
  stopLoss?: string | number | null;
  takeProfit?: string | number | null;
  isHedge?: boolean | null;
  hedgeTriggered?: boolean | null;
  hedgeStatus?: string | null;
  riskPercentage?: string | number | null;
  riskAmount?: string | number | null;
  frozenLoss?: string | number | null;
  hedgePnl?: string | number | null;
  hedgePnlPercent?: string | number | null;
  [key: string]: unknown;
}

interface TradeModalProps {
  userId: string;
  accountId: number;
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: TradeRecord | null; 
}

const STRATEGIES = [
  "Hedge / Cobertura",
  "Price Action",
  "Smart Money / ICT",
  "Breakout",
  "Trend Following",
  "Reversal",
  "Scalping",
  "News / Fundamental",
  "Algorithmic"
];

function TradeModalForm({ 
  userId, 
  accountId, 
  onClose, 
  tradeToEdit 
}: { 
  userId: string; 
  accountId: number; 
  onClose: () => void; 
  tradeToEdit?: TradeRecord | null;
}) {
  const { selectedAccount } = useAccount();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>(tradeToEdit?.type ? String(tradeToEdit.type) : 'LONG');

  const [entryPrice, setEntryPrice] = useState<string>(tradeToEdit?.entryPrice ? String(tradeToEdit.entryPrice) : '');
  const [stopLoss, setStopLoss] = useState<string>(tradeToEdit?.stopLoss ? String(tradeToEdit.stopLoss) : '');
  const [size, setSize] = useState<string>(tradeToEdit?.size ? String(tradeToEdit.size) : '');

  // Hedge Mode state
  const [isHedge, setIsHedge] = useState<boolean>(Boolean(tradeToEdit?.isHedge));
  const [riskPercentage, setRiskPercentage] = useState<string>(tradeToEdit?.riskPercentage ? String(tradeToEdit.riskPercentage) : '');
  
  // Calculate initial risk amount if not set
  const initialCalculatedRisk = (() => {
    if (tradeToEdit?.riskAmount) return String(tradeToEdit.riskAmount);
    if (tradeToEdit?.entryPrice && tradeToEdit?.stopLoss && tradeToEdit?.size) {
      const e = parseFloat(String(tradeToEdit.entryPrice));
      const sl = parseFloat(String(tradeToEdit.stopLoss));
      const sz = parseFloat(String(tradeToEdit.size));
      if (!isNaN(e) && !isNaN(sl) && !isNaN(sz)) {
        const autoRisk = Math.abs(e - sl) * sz;
        if (autoRisk > 0) return autoRisk.toFixed(2);
      }
    }
    return '';
  })();

  const [riskAmount, setRiskAmount] = useState<string>(initialCalculatedRisk);
  const [frozenLoss, setFrozenLoss] = useState<string>(
    tradeToEdit?.frozenLoss ? String(tradeToEdit.frozenLoss) : initialCalculatedRisk
  );

  const [hedgeTriggered, setHedgeTriggered] = useState<boolean>(Boolean(tradeToEdit?.hedgeTriggered));
  const [hedgeStatus, setHedgeStatus] = useState<'WIN' | 'LOSS' | 'BREAKEVEN' | 'MANAGING'>(
    tradeToEdit?.hedgeStatus === 'WIN' ? 'WIN' :
    tradeToEdit?.hedgeStatus === 'LOSS' ? 'LOSS' :
    tradeToEdit?.hedgeStatus === 'BREAKEVEN' ? 'BREAKEVEN' : 'MANAGING'
  );

  const [hedgePnl, setHedgePnl] = useState<string>(tradeToEdit?.hedgePnl ? String(tradeToEdit.hedgePnl) : '');
  const [hedgePnlPercent, setHedgePnlPercent] = useState<string>(tradeToEdit?.hedgePnlPercent ? String(tradeToEdit.hedgePnlPercent) : '');

  const isRiskFixed = Boolean(tradeToEdit && (tradeToEdit.riskPercentage || tradeToEdit.riskAmount));

  const handleAutoCalcRisk = (newEntry?: string, newSl?: string, newSize?: string) => {
    if (isRiskFixed) return;
    const e = parseFloat(newEntry ?? entryPrice);
    const sl = parseFloat(newSl ?? stopLoss);
    const s = parseFloat(newSize ?? size);
    if (!isNaN(e) && !isNaN(sl) && !isNaN(s) && e > 0 && sl > 0 && s > 0) {
      const calculatedDollarRisk = Math.abs(e - sl) * s;
      if (calculatedDollarRisk > 0) {
        setRiskAmount(calculatedDollarRisk.toFixed(2));
        if (selectedAccount?.initialBalance) {
          const bal = parseFloat(selectedAccount.initialBalance);
          if (bal > 0) {
            setRiskPercentage(((calculatedDollarRisk / bal) * 100).toFixed(2));
          }
        }
      }
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    formData.set('isHedge', isHedge ? 'true' : 'false');
    formData.set('riskPercentage', isHedge ? riskPercentage : '');
    formData.set('riskAmount', isHedge ? riskAmount : '');
    formData.set('frozenLoss', isHedge && hedgeTriggered && hedgeStatus === 'MANAGING' ? frozenLoss : (tradeToEdit?.frozenLoss ? String(tradeToEdit.frozenLoss) : ''));
    formData.set('hedgeTriggered', isHedge && hedgeTriggered ? 'true' : 'false');
    formData.set('hedgeStatus', isHedge ? (hedgeTriggered ? hedgeStatus : 'NOT_TRIGGERED') : '');
    formData.set('hedgePnl', isHedge && hedgeTriggered ? (hedgeStatus === 'MANAGING' ? '' : hedgePnl) : '');
    formData.set('hedgePnlPercent', isHedge && hedgeTriggered ? (hedgeStatus === 'MANAGING' ? '' : hedgePnlPercent) : '');
    
    if (isHedge && hedgeTriggered && hedgeStatus === 'MANAGING') {
      formData.delete('exitPrice');
    }
    
    if (tradeToEdit?.id) {
      formData.append('tradeId', String(tradeToEdit.id)); 
      formData.append('type', type); 
      await updateTrade(formData);
    } else {
      formData.append('userId', userId);
      formData.append('accountId', accountId.toString());
      formData.append('type', type);
      await createTrade(formData);
    }
    
    setLoading(false);
    onClose();
  }

  const isLong = type === 'LONG';

  return (
    <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/[0.12] bg-[#121824] p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08] sticky top-0 bg-[#121824]/95 backdrop-blur-md z-20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {tradeToEdit ? 'Editar / Cerrar Operación' : 'Registrar Nueva Operación'}
            </h2>
            {isHedge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
                Modo Cobertura
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {tradeToEdit ? 'Actualiza precios de salida, gestión de cobertura o notas' : 'Ingresa los parámetros de entrada y gestión'}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-5">
        
        {/* 1. SELECTOR LONG / SHORT */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0D1117] rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setType('LONG')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isLong 
                ? 'bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/40 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={15} /> LONG (COMPRA)
          </button>
          <button
            type="button"
            onClick={() => setType('SHORT')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isLong 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown size={15} /> SHORT (VENTA)
          </button>
        </div>

        {/* 2. TOGGLE MODO HEDGE */}
        <div 
          onClick={() => setIsHedge(!isHedge)}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
            isHedge 
              ? 'bg-gradient-to-r from-[#00A3FF]/15 via-[#161D2B] to-[#00E599]/10 border-[#00A3FF]/50 shadow-[0_0_25px_rgba(0,163,255,0.15)]' 
              : 'bg-[#0D1117] border-white/[0.06] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${
              isHedge ? 'bg-[#00A3FF] text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
            }`}>
              <Layers size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                Operar en Modo Cobertura (Hedge)
              </p>
              <p className="text-[11px] text-slate-400">
                {isHedge ? 'Gestión con orden espejo contraria en lugar de stop loss directo' : 'Activar para registrar cobertura, riesgo % y flotante pendiente'}
              </p>
            </div>
          </div>
          
          <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out shrink-0 ${
            isHedge ? 'bg-[#00A3FF]' : 'bg-slate-700'
          }`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
              isHedge ? 'translate-x-5' : ''
            }`} />
          </div>
        </div>

        {/* 3. PAR Y ESTRATEGIA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Par / Instrumento</label>
            <input 
              name="symbol" 
              required 
              defaultValue={tradeToEdit?.symbol ? String(tradeToEdit.symbol) : ''}
              placeholder="ej. BTCUSDT, EURUSD, XAUUSD" 
              className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-3 text-white outline-none uppercase font-mono text-sm tracking-wide" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Estrategia Operativa</label>
            <div className="relative">
              <select 
                name="strategy" 
                defaultValue={tradeToEdit?.strategy ? String(tradeToEdit.strategy) : (isHedge ? "Hedge / Cobertura" : "")}
                className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-3 text-white outline-none appearance-none cursor-pointer text-sm" 
              >
                <option value="" className="text-slate-500">Seleccionar estrategia...</option>
                {STRATEGIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PRECIO DE ENTRADA Y TAMAÑO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Precio de Entrada</label>
            <input 
              name="entryPrice" 
              type="number" 
              step="any" 
              required 
              value={entryPrice}
              onChange={(e) => {
                setEntryPrice(e.target.value);
                handleAutoCalcRisk(e.target.value, undefined, undefined);
              }}
              placeholder="0.0000" 
              className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-3 text-white outline-none font-mono text-sm" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tamaño (Lots / Contratos / Monedas)</label>
            <input 
              name="size" 
              type="number" 
              step="any" 
              required 
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                handleAutoCalcRisk(undefined, undefined, e.target.value);
              }}
              placeholder="ej. 0.10" 
              className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-3 text-white outline-none font-mono text-sm" 
            />
          </div>
        </div>

        {/* 5. STOP LOSS Y TAKE PROFIT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              {isHedge ? 'Nivel Cobertura / SL Referencial' : 'Stop Loss (SL)'}
            </label>
            <input 
              name="stopLoss" 
              type="number" 
              step="any" 
              value={stopLoss}
              onChange={(e) => {
                setStopLoss(e.target.value);
                handleAutoCalcRisk(undefined, e.target.value, undefined);
              }}
              placeholder="Opcional" 
              className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-rose-500 rounded-xl p-3 text-white outline-none font-mono text-sm" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Take Profit (TP)</label>
            <input 
              name="takeProfit" 
              type="number" 
              step="any" 
              defaultValue={tradeToEdit?.takeProfit ? String(tradeToEdit.takeProfit) : ''}
              placeholder="Opcional" 
              className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00E599] rounded-xl p-3 text-white outline-none font-mono text-sm" 
            />
          </div>
        </div>

        {/* --- BLOQUE ESPECÍFICO DE HEDGE MODE --- */}
        {isHedge && (
          <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#00A3FF]/30 space-y-4 animate-in fade-in duration-300 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#00A3FF]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Gestión Cuantitativa de Riesgo</span>
              </div>
              {riskAmount && (
                <span className="text-[11px] font-mono text-[#00E599] font-bold">
                  Riesgo: ${riskAmount}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-medium">Riesgo en Cuenta (%)</label>
                  {isRiskFixed && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                      <Lock size={10} /> Fijo
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    step="any" 
                    min="0" 
                    placeholder="ej. 1.0" 
                    value={riskPercentage}
                    readOnly={isRiskFixed}
                    onChange={(e) => !isRiskFixed && setRiskPercentage(e.target.value)}
                    className={`w-full border rounded-xl p-3 pr-8 font-mono text-sm outline-none transition ${
                      isRiskFixed 
                        ? 'bg-slate-900 text-slate-400 border-white/[0.04] cursor-not-allowed select-none' 
                        : 'bg-[#121824] text-white border-white/[0.08] focus:border-[#00A3FF]'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-medium">Riesgo en Dinero ($)</label>
                  {isRiskFixed && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                      <Lock size={10} /> Fijo
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    step="any" 
                    min="0" 
                    placeholder="ej. 100.00" 
                    value={riskAmount}
                    readOnly={isRiskFixed}
                    onChange={(e) => !isRiskFixed && setRiskAmount(e.target.value)}
                    className={`w-full border rounded-xl p-3 pl-7 font-mono text-sm outline-none transition ${
                      isRiskFixed 
                        ? 'bg-slate-900 text-slate-400 border-white/[0.04] cursor-not-allowed select-none' 
                        : 'bg-[#121824] text-white border-white/[0.08] focus:border-[#00A3FF]'
                    }`}
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs text-slate-300 block font-medium">¿Se ejecutó la orden de cobertura?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHedgeTriggered(false)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    !hedgeTriggered 
                      ? 'bg-blue-500/20 text-[#00A3FF] border-[#00A3FF]/50 shadow-sm' 
                      : 'bg-[#121824] text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  No, directo al TP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHedgeTriggered(true);
                    if (!frozenLoss && riskAmount) setFrozenLoss(riskAmount);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    hedgeTriggered 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' 
                      : 'bg-[#121824] text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  Sí, cobertura activada
                </button>
              </div>
            </div>

            {hedgeTriggered && (
              <div className="space-y-3 pt-2 bg-[#121824] p-4 rounded-xl border border-amber-500/25 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs text-slate-300 mb-2 block font-medium">Estado / Resultado de la Cobertura</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHedgeStatus('MANAGING');
                        if (!frozenLoss && riskAmount) setFrozenLoss(riskAmount);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        hedgeStatus === 'MANAGING' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm ring-1 ring-amber-500/40' 
                          : 'bg-[#0D1117] text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <Clock size={12} className={hedgeStatus === 'MANAGING' ? 'animate-spin text-amber-400' : 'text-slate-400'} />
                      Gestionando
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setHedgeStatus('WIN');
                        if (hedgePnl && Number(hedgePnl) < 0) setHedgePnl(Math.abs(Number(hedgePnl)).toString());
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        hedgeStatus === 'WIN' 
                          ? 'bg-[#00E599]/20 text-[#00E599] border-[#00E599]/50 shadow-sm' 
                          : 'bg-[#0D1117] text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      Ganada (WIN)
                    </button>

                    <button
                      type="button"
                      onClick={() => setHedgeStatus('LOSS')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        hedgeStatus === 'LOSS' 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm' 
                          : 'bg-[#0D1117] text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      Perdida (LOSS)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHedgeStatus('BREAKEVEN');
                        setHedgePnl('0');
                        setHedgePnlPercent('0');
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        hedgeStatus === 'BREAKEVEN' 
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm' 
                          : 'bg-[#0D1117] text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      Breakeven (BE)
                    </button>
                  </div>
                </div>

                {hedgeStatus === 'MANAGING' ? (
                  <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-400 animate-spin" />
                        Pérdida Congelada Temporal
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        -${frozenLoss && !isNaN(Number(frozenLoss.replace(',', '.'))) ? Math.abs(Number(frozenLoss.replace(',', '.'))).toFixed(2) : '0.00'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Mientras la orden esté en <strong className="text-amber-300">Gestionando</strong>, este flotante se descontará automáticamente del balance general para mantener la cuenta ajustada al riesgo real.
                    </p>

                    <div className="pt-1">
                      <div className="relative">
                        <input 
                          type="number" 
                          step="any" 
                          min="0" 
                          placeholder="Monto congelado en dólares"
                          value={frozenLoss}
                          onChange={(e) => setFrozenLoss(e.target.value)}
                          className="w-full bg-[#0D1117] border border-amber-500/40 focus:border-amber-400 rounded-xl p-2.5 pl-7 text-white outline-none font-mono text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block font-medium">PnL Cobertura ($)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="any" 
                          placeholder={hedgeStatus === 'LOSS' ? "-10.00" : hedgeStatus === 'WIN' ? "+15.00" : "0.00"}
                          value={hedgePnl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHedgePnl(val);
                            if (val && (!hedgePnlPercent || hedgePnlPercent === '')) {
                              const num = parseFloat(val.replace(',', '.'));
                              const rAmt = parseFloat(riskAmount.replace(',', '.'));
                              const rPct = parseFloat(riskPercentage.replace(',', '.'));
                              if (!isNaN(num) && !isNaN(rAmt) && !isNaN(rPct) && rAmt > 0) {
                                setHedgePnlPercent(((num / rAmt) * rPct).toFixed(2));
                              } else if (selectedAccount?.initialBalance) {
                                const bal = parseFloat(selectedAccount.initialBalance);
                                if (!isNaN(bal) && bal > 0 && !isNaN(num)) {
                                  setHedgePnlPercent(((num / bal) * 100).toFixed(2));
                                }
                              }
                            }
                          }}
                          className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-2.5 pl-7 text-white outline-none font-mono text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 mb-1 block font-medium">PnL Cobertura (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="any" 
                          placeholder={hedgeStatus === 'LOSS' ? "-1.0" : hedgeStatus === 'WIN' ? "+1.5" : "0.0"}
                          value={hedgePnlPercent}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHedgePnlPercent(val);
                            if (val && (!hedgePnl || hedgePnl === '')) {
                              const num = parseFloat(val.replace(',', '.'));
                              const rAmt = parseFloat(riskAmount.replace(',', '.'));
                              const rPct = parseFloat(riskPercentage.replace(',', '.'));
                              if (!isNaN(num) && !isNaN(rAmt) && !isNaN(rPct) && rPct > 0) {
                                setHedgePnl(((num / rPct) * rAmt).toFixed(2));
                              } else if (selectedAccount?.initialBalance) {
                                const bal = parseFloat(selectedAccount.initialBalance);
                                if (!isNaN(bal) && bal > 0 && !isNaN(num)) {
                                  setHedgePnl((bal * (num / 100)).toFixed(2));
                                }
                              }
                            }
                          }}
                          className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-2.5 pr-7 text-white outline-none font-mono text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. EXIT PRICE (CIERRE DE LA OPERACIÓN) */}
        <div className="bg-[#0D1117] p-4 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#00A3FF] block">Precio de Salida (Cierre)</label>
            {hedgeStatus === 'MANAGING' && hedgeTriggered ? (
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <Clock size={11} className="animate-spin" /> En gestión activa (dejar vacío)
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Dejar en blanco si continúa abierta</span>
            )}
          </div>
          <input 
            name="exitPrice" 
            type="number" 
            step="any" 
            defaultValue={hedgeStatus === 'MANAGING' && hedgeTriggered ? '' : (tradeToEdit?.exitPrice ? String(tradeToEdit.exitPrice) : '')}
            placeholder={hedgeStatus === 'MANAGING' && hedgeTriggered ? "Operación en gestión (dejar vacío)" : "0.0000"} 
            className="w-full bg-[#121824] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-3 text-white outline-none font-mono text-sm" 
          />
        </div>

        {/* BOTÓN ENVIAR */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
            isLong 
              ? 'bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:brightness-105' 
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:brightness-105'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : tradeToEdit ? (
            'Guardar Cambios'
          ) : isLong ? (
            'Abrir Orden LONG'
          ) : (
            'Abrir Orden SHORT'
          )}
        </button>

      </form>
    </div>
  );
}

export function TradeModal({ userId, accountId, isOpen, onClose, tradeToEdit }: TradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <TradeModalForm 
        key={tradeToEdit?.id ? String(tradeToEdit.id) : 'new-trade'}
        userId={userId}
        accountId={accountId}
        onClose={onClose}
        tradeToEdit={tradeToEdit}
      />
    </div>
  );
}