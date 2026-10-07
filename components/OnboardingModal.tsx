// components/OnboardingModal.tsx
'use client';

import { useState } from 'react';
import { useAccount } from '@/app/context/AccountContext';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export function OnboardingModal() {
  const { accounts, isLoading, createNewAccount } = useAccount();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Si está cargando o SI tiene cuentas, no mostramos nada
  if (isLoading || accounts.length > 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const success = await createNewAccount(name, balance);
    if (!success) {
      setError('Could not create account. Please try again.');
    }
    setSubmitting(false);
    // El modal desaparecerá solo porque accounts.length > 0 será true
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF7F] to-[#00A3FF]">
            Welcome Trader
          </h1>
          <p className="text-gray-400">
            To start your journey, let's create your first Trading Account.
          </p>
        </div>

        <div className="bg-[#1e2329] p-8 rounded-2xl border border-gray-800 shadow-2xl text-left">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Account Name</label>
              <input 
                required
                placeholder="e.g. Binance Futures, Funded Acc"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-xl p-3 text-white focus:border-[#00FF7F] outline-none mt-1"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Initial Balance</label>
              <input 
                required
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 1000"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-xl p-3 text-white focus:border-[#00FF7F] outline-none mt-1"
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#00FF7F] hover:bg-[#00e676] text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
        
        <p className="text-xs text-gray-600">
          You can add more accounts later from the sidebar.
        </p>
      </div>
    </div>
  );
}