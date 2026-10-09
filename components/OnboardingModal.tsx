// components/OnboardingModal.tsx
'use client';

import { useState } from 'react';
import { useAccount } from '@/app/context/AccountContext';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

export function OnboardingModal() {
  const { accounts, isLoading, createNewAccount } = useAccount();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isLoading || accounts.length > 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const success = await createNewAccount(name, balance);
    if (!success) {
      setError('No se pudo crear la cuenta inicial. Inténtalo de nuevo.');
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-md space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex justify-center scale-90 mb-2">
          <Logo />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bienvenido al <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] to-[#00A3FF]">Trading Journal</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Para iniciar tu bitácora, crea tu primera cuenta de operaciones.
          </p>
        </div>

        <div className="bg-[#121824] p-7 rounded-3xl border border-white/[0.12] shadow-2xl text-left">
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
                placeholder="ej. Binance Futures, FTMO 100k, Bybit"
                value={name}
                onChange={e => setName(e.target.value)}
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
                  onChange={e => setBalance(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/[0.08] focus:border-[#00E599] rounded-xl p-3 pl-8 text-white outline-none font-mono text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full mt-2 bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 font-bold py-3.5 rounded-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,153,0.3)]"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <>Crear Primera Cuenta <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
        
        <p className="text-xs text-slate-500">
          Podrás añadir más cuentas o sincronizar múltiples brokers desde el menú lateral.
        </p>
      </div>
    </div>
  );
}