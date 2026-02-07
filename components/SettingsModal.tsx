// components/SettingsModal.tsx
'use client';

import { useState } from 'react';
import { updateInitialBalance } from '@/app/actions';
import { X, Loader2, Save } from 'lucide-react';

interface SettingsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  currentInitialBalance: string;
}

export function SettingsModal({ userId, isOpen, onClose, currentInitialBalance }: SettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(currentInitialBalance);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateInitialBalance(userId, balance);
    setLoading(false);
    onClose();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-[#1e2329] p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Account Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block uppercase font-bold">Initial Capital ($)</label>
            <input 
              type="number" 
              step="any"
              required 
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-[#0b0e11] border border-gray-700 rounded-xl p-4 text-2xl font-mono text-white focus:border-[#00A3FF] outline-none" 
            />
            <p className="text-xs text-gray-500 mt-2">
              This will recalculate your equity curve from the start.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-[#00A3FF] text-white font-bold hover:bg-[#008ecc] transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Update Balance</>}
          </button>
        </form>
      </div>
    </div>
  );
}