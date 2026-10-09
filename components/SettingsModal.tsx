// components/SettingsModal.tsx
'use client';

import { useState } from 'react';
import { updateInitialBalance } from '@/app/actions';
import { X, Loader2, Save, Wallet } from 'lucide-react';

interface SettingsModalProps {
  userId: string;
  accountId: number;
  isOpen: boolean;
  onClose: () => void;
  currentInitialBalance: string;
}

export function SettingsModal({ userId, accountId, isOpen, onClose, currentInitialBalance }: SettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(currentInitialBalance);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateInitialBalance(userId, accountId, balance);
    setLoading(false);
    onClose();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.12] bg-[#121824] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00A3FF]/15 text-[#00A3FF] rounded-xl border border-[#00A3FF]/30">
              <Wallet size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ajustes de Cuenta</h2>
              <p className="text-[11px] text-slate-400">Configuración de capital base</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Capital Inicial ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base">$</span>
              <input 
                type="number" 
                step="any"
                required 
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00A3FF] rounded-xl p-3.5 pl-8 text-xl font-mono text-white outline-none font-bold" 
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              El cambio recalculará automáticamente la curva de crecimiento y el retorno neto de esta cuenta.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#00A3FF] text-white font-bold hover:brightness-110 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,163,255,0.3)] cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={16}/> Guardar Balance</>}
          </button>
        </form>
      </div>
    </div>
  );
}