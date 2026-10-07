// components/TradeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createTrade, updateTrade } from '@/app/actions';
import { X, Loader2, ShieldCheck, ShieldAlert, Layers, Percent, DollarSign, ArrowRightLeft } from 'lucide-react';

interface TradeModalProps {
  userId: string;
  accountId: number;
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: any; 
}

export function TradeModal({ userId, accountId, isOpen, onClose, tradeToEdit }: TradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('LONG');

  // Hedge Mode state
  const [isHedge, setIsHedge] = useState(false);
  const [riskPercentage, setRiskPercentage] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [hedgeTriggered, setHedgeTriggered] = useState(false);
  const [hedgeStatus, setHedgeStatus] = useState<'WIN' | 'LOSS' | 'BREAKEVEN'>('WIN');
  const [hedgePnl, setHedgePnl] = useState('');
  const [hedgePnlPercent, setHedgePnlPercent] = useState('');

  // Predefined strategies
  const strategies = [
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

  // Load existing data when editing
  useEffect(() => {
    if (isOpen && tradeToEdit) {
      setType(tradeToEdit.type || 'LONG');
      setIsHedge(Boolean(tradeToEdit.isHedge));
      setRiskPercentage(tradeToEdit.riskPercentage || '');
      setRiskAmount(tradeToEdit.riskAmount || '');
      setHedgeTriggered(Boolean(tradeToEdit.hedgeTriggered));
      setHedgeStatus(
        tradeToEdit.hedgeStatus === 'LOSS' ? 'LOSS' : 
        tradeToEdit.hedgeStatus === 'BREAKEVEN' ? 'BREAKEVEN' : 'WIN'
      );
      setHedgePnl(tradeToEdit.hedgePnl || '');
      setHedgePnlPercent(tradeToEdit.hedgePnlPercent || '');
    } else {
      setType('LONG');
      setIsHedge(false);
      setRiskPercentage('');
      setRiskAmount('');
      setHedgeTriggered(false);
      setHedgeStatus('WIN');
      setHedgePnl('');
      setHedgePnlPercent('');
    }
  }, [isOpen, tradeToEdit]);

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    // Append hedge values
    formData.set('isHedge', isHedge ? 'true' : 'false');
    formData.set('riskPercentage', isHedge ? riskPercentage : '');
    formData.set('riskAmount', isHedge ? riskAmount : '');
    formData.set('hedgeTriggered', isHedge && hedgeTriggered ? 'true' : 'false');
    formData.set('hedgeStatus', isHedge ? (hedgeTriggered ? hedgeStatus : 'NOT_TRIGGERED') : '');
    formData.set('hedgePnl', isHedge && hedgeTriggered ? hedgePnl : '');
    formData.set('hedgePnlPercent', isHedge && hedgeTriggered ? hedgePnlPercent : '');
    
    if (tradeToEdit) {
      // --- UPDATE MODE ---
      formData.append('tradeId', tradeToEdit.id); 
      formData.append('type', type); 
      await updateTrade(formData);
    } else {
      // --- CREATE MODE ---
      formData.append('userId', userId);
      formData.append('accountId', accountId.toString());
      formData.append('type', type);
      await createTrade(formData);
    }
    
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-800 bg-[#1e2329] p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 sticky top-0 bg-[#1e2329] pb-2 z-10 border-b border-gray-800/60">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {tradeToEdit ? 'Edit / Close Trade' : 'Register New Trade'}
              {isHedge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40">
                  Hedge Mode
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500">
              {tradeToEdit ? 'Update trade metrics and hedge outcomes' : 'Fill in entry details and hedge parameters'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={22} />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          
          {/* Selector LONG / SHORT */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0b0e11] rounded-lg">
            <button
              type="button"
              onClick={() => setType('LONG')}
              className={`py-2 rounded-md text-sm font-bold transition-all ${
                type === 'LONG' ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              LONG
            </button>
            <button
              type="button"
              onClick={() => setType('SHORT')}
              className={`py-2 rounded-md text-sm font-bold transition-all ${
                type === 'SHORT' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              SHORT
            </button>
          </div>

          {/* Toggle: Modo Hedge / Cobertura */}
          <div 
            onClick={() => setIsHedge(!isHedge)}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              isHedge 
                ? 'bg-gradient-to-r from-[#00A3FF]/15 to-[#00FF7F]/10 border-[#00A3FF]/60 shadow-[0_0_20px_rgba(0,163,255,0.15)]' 
                : 'bg-[#13171D] border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isHedge ? 'bg-[#00A3FF] text-black' : 'bg-gray-800 text-gray-400'}`}>
                <Layers size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  Operar en Modo Hedge (Cobertura)
                </p>
                <p className="text-xs text-gray-400">
                  {isHedge ? 'Gestión con orden contraria en lugar de SL directo' : 'Activar para registrar coberturas y riesgo %'}
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${isHedge ? 'bg-[#00A3FF]' : 'bg-gray-700'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${isHedge ? 'translate-x-5' : ''}`} />
            </div>
          </div>

          {/* Grid: Symbol + Strategy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pair / Symbol</label>
              <input 
                name="symbol" 
                required 
                defaultValue={tradeToEdit?.symbol || ''}
                placeholder="BTCUSDT" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00A3FF] outline-none uppercase font-mono" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Strategy</label>
              <div className="relative">
                <select 
                  name="strategy" 
                  defaultValue={tradeToEdit?.strategy || (isHedge ? "Hedge / Cobertura" : "")}
                  className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00A3FF] outline-none appearance-none cursor-pointer text-sm" 
                >
                  <option value="" className="text-gray-500">Select...</option>
                  {strategies.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Entry Price + Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Entry Price</label>
              <input 
                name="entryPrice" 
                type="number" 
                step="any" 
                required 
                defaultValue={tradeToEdit?.entryPrice || ''}
                placeholder="0.00" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00A3FF] outline-none font-mono" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Size</label>
              <input 
                name="size" 
                type="number" 
                step="any" 
                required 
                defaultValue={tradeToEdit?.size || ''}
                placeholder="Amount" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00A3FF] outline-none font-mono" 
              />
            </div>
          </div>

          {/* --- BLOQUE ESPECÍFICO DE HEDGE MODE --- */}
          {isHedge && (
            <div className="bg-[#10141a] p-4 rounded-xl border border-[#00A3FF]/30 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                <ShieldCheck size={16} className="text-[#00A3FF]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Gestión de Cobertura y Riesgo</span>
              </div>

              {/* Riesgo de la cuenta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block font-medium">Riesgo Cuenta (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="any" 
                      min="0"
                      placeholder="e.g. 1.0" 
                      value={riskPercentage}
                      onChange={(e) => setRiskPercentage(e.target.value)}
                      className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 pr-8 text-white focus:border-[#00A3FF] outline-none font-mono text-sm" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block font-medium">Riesgo en Dinero ($)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="any" 
                      min="0"
                      placeholder="e.g. 100.00" 
                      value={riskAmount}
                      onChange={(e) => setRiskAmount(e.target.value)}
                      className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 pl-7 text-white focus:border-[#00A3FF] outline-none font-mono text-sm" 
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
                  </div>
                </div>
              </div>

              {/* ¿Tocó cobertura? */}
              <div className="space-y-2 pt-1">
                <label className="text-xs text-gray-400 block font-medium">¿Se activó la orden de cobertura?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHedgeTriggered(false)}
                    className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                      !hedgeTriggered 
                        ? 'bg-blue-500/20 text-[#00A3FF] border-[#00A3FF]/50 shadow-sm' 
                        : 'bg-[#0b0e11] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    No tocó cobertura
                  </button>
                  <button
                    type="button"
                    onClick={() => setHedgeTriggered(true)}
                    className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                      hedgeTriggered 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm' 
                        : 'bg-[#0b0e11] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    Sí, cobertura activada
                  </button>
                </div>
              </div>

              {/* Si se activó la cobertura: Detalles del resultado */}
              {hedgeTriggered && (
                <div className="space-y-3 pt-2 bg-[#13171f] p-3 rounded-lg border border-amber-500/20 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Resultado de la Cobertura</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setHedgeStatus('WIN')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          hedgeStatus === 'WIN' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-sm' 
                            : 'bg-[#0b0e11] text-gray-500 border-gray-800'
                        }`}
                      >
                        Ganada (WIN)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHedgeStatus('LOSS')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          hedgeStatus === 'LOSS' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-sm' 
                            : 'bg-[#0b0e11] text-gray-500 border-gray-800'
                        }`}
                      >
                        Perdida (LOSS)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHedgeStatus('BREAKEVEN')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          hedgeStatus === 'BREAKEVEN' 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-sm' 
                            : 'bg-[#0b0e11] text-gray-500 border-gray-800'
                        }`}
                      >
                        Breakeven (BE)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">PnL Cobertura ($)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="any" 
                          placeholder="e.g. +150 o -50"
                          value={hedgePnl}
                          onChange={(e) => setHedgePnl(e.target.value)}
                          className={`w-full bg-[#0b0e11] border rounded-lg p-2.5 pl-7 text-white outline-none font-mono text-sm ${
                            hedgeStatus === 'WIN' ? 'border-green-500/40 focus:border-green-400' :
                            hedgeStatus === 'LOSS' ? 'border-red-500/40 focus:border-red-400' :
                            'border-yellow-500/40 focus:border-yellow-400'
                          }`}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">PnL Cobertura (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="any" 
                          placeholder="e.g. +1.5 o -0.5"
                          value={hedgePnlPercent}
                          onChange={(e) => setHedgePnlPercent(e.target.value)}
                          className={`w-full bg-[#0b0e11] border rounded-lg p-2.5 pr-7 text-white outline-none font-mono text-sm ${
                            hedgeStatus === 'WIN' ? 'border-green-500/40 focus:border-green-400' :
                            hedgeStatus === 'LOSS' ? 'border-red-500/40 focus:border-red-400' :
                            'border-yellow-500/40 focus:border-yellow-400'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 italic">
                    ℹ️ El resultado de la cobertura se sumará al PnL total del trade al cerrarse la operación.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Exit Price (Crucial for Closing) */}
          <div className="bg-[#13171D] p-3 rounded-xl border border-gray-800/50">
             <label className="text-xs text-[#00A3FF] mb-1 block font-bold">Exit Price (Close Trade)</label>
             <input 
                name="exitPrice" 
                type="number" 
                step="any" 
                defaultValue={tradeToEdit?.exitPrice || ''}
                placeholder="Leave empty if OPEN" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00A3FF] outline-none font-mono" 
              />
          </div>

          {/* Stop Loss & Take Profit (si NO está en modo hedge o como referencia opcional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {isHedge ? 'Nivel Cobertura / SL (Ref)' : 'Stop Loss'}
              </label>
              <input 
                name="stopLoss" 
                type="number" 
                step="any" 
                defaultValue={tradeToEdit?.stopLoss || ''}
                placeholder="Optional" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none font-mono" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Take Profit</label>
              <input 
                name="takeProfit" 
                type="number" 
                step="any" 
                defaultValue={tradeToEdit?.takeProfit || ''}
                placeholder="Optional" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none font-mono" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3.5 mt-4 rounded-xl font-bold text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              type === 'LONG' 
                ? 'bg-gradient-to-r from-[#00FF7F] to-[#00e676] hover:opacity-90 shadow-[0_0_20px_rgba(0,255,127,0.25)]' 
                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white shadow-[0_0_20px_rgba(239,68,68,0.25)]'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : tradeToEdit ? (
              'Save Changes'
            ) : type === 'LONG' ? (
              'Open Long'
            ) : (
              'Open Short'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}