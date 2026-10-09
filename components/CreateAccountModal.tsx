// components/CreateAccountModal.tsx
'use client';

import { useState } from 'react';
import { useAccount } from '@/app/context/AccountContext';
import { X, Loader2, PlusCircle, AlertCircle, Wallet } from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
  const { createNewAccount } = useAccount();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await createNewAccount(name, balance);
    
    setLoading(false);
    
    if (success) {
      setName('');
      setBalance('');
      setError('');
      onClose();
    } else {
      setError('No se pudo crear la cuenta. Por favor intenta de nuevo.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.12] bg-[#121824] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00E599]/15 text-[#00E599] rounded-xl border border-[#00E599]/30">
              <Wallet size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nueva Cuenta de Trading</h2>
              <p className="text-[11px] text-slate-400">Separa tus operativas y balances</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Nombre de la Cuenta</label>
            <input 
              required
              placeholder="ej. Bybit Futures, FTMO 50k, Binance Spot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00E599] rounded-xl p-3 text-white outline-none text-sm placeholder:text-slate-500" 
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Capital Inicial ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
              <input 
                required
                type="number"
                step="any"
                min="0"
                placeholder="10000.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00E599] rounded-xl p-3 pl-8 text-white outline-none font-mono text-sm placeholder:text-slate-500" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 font-bold hover:brightness-105 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,153,0.3)] cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <><PlusCircle size={17}/> Crear Cuenta</>}
          </button>
        </form>
      </div>
    </div>
  );
}