// components/CreateAccountModal.tsx
'use client';

import { useState } from 'react';
import { useAccount } from '@/app/context/AccountContext';
import { X, Loader2, PlusCircle } from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
  const { createNewAccount } = useAccount();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Llamamos a la función del contexto
    const success = await createNewAccount(name, balance);
    
    setLoading(false);
    
    if (success) {
      // Limpiamos y cerramos solo si tuvo éxito
      setName('');
      setBalance('');
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-[#1e2329] p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">New Trading Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block uppercase font-bold">Account Name</label>
            <input 
              required
              placeholder="e.g. Bybit Futures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0b0e11] border border-gray-700 rounded-xl p-3 text-white focus:border-[#00FF7F] outline-none placeholder-gray-600" 
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block uppercase font-bold">Initial Balance</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input 
                required
                type="number"
                step="any"
                placeholder="1000.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-xl p-3 pl-7 text-white focus:border-[#00FF7F] outline-none placeholder-gray-600" 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-[#00FF7F] text-black font-bold hover:bg-[#00e676] transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,127,0.2)] hover:shadow-[0_0_20px_rgba(0,255,127,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <><PlusCircle size={18}/> Create Account</>}
          </button>
        </form>
      </div>
    </div>
  );
}