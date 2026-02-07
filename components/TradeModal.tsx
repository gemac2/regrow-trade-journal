// components/TradeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createTrade, updateTrade } from '@/app/actions';
import { X, Loader2 } from 'lucide-react';

interface TradeModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: any; // New prop: optional trade data to edit
}

export function TradeModal({ userId, isOpen, onClose, tradeToEdit }: TradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('LONG');

  // Load existing data when editing
  useEffect(() => {
    if (isOpen && tradeToEdit) {
      setType(tradeToEdit.type);
    } else {
      setType('LONG'); // Default for new trade
    }
  }, [isOpen, tradeToEdit]);

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    
    if (tradeToEdit) {
      // --- UPDATE MODE ---
      formData.append('tradeId', tradeToEdit.id); // Send ID to backend
      formData.append('type', type); // Ensure type state is sent
      await updateTrade(formData);
    } else {
      // --- CREATE MODE ---
      formData.append('userId', userId);
      formData.append('type', type);
      await createTrade(formData);
    }
    
    setLoading(false);
    onClose();
    window.location.reload(); 
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#1e2329] p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {tradeToEdit ? 'Edit / Close Trade' : 'Register New Trade'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          
          {/* Selector LONG / SHORT */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0b0e11] rounded-lg">
            <button
              type="button"
              onClick={() => setType('LONG')}
              className={`py-2 rounded-md text-sm font-bold transition-all ${
                type === 'LONG' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              LONG
            </button>
            <button
              type="button"
              onClick={() => setType('SHORT')}
              className={`py-2 rounded-md text-sm font-bold transition-all ${
                type === 'SHORT' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              SHORT
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pair / Symbol</label>
            <input 
              name="symbol" 
              required 
              defaultValue={tradeToEdit?.symbol || ''}
              placeholder="BTCUSDT" 
              className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none uppercase" 
            />
          </div>

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
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
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
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
              />
            </div>
          </div>
          
          {/* Exit Price (Crucial for Closing) */}
          <div className="bg-[#13171D] p-3 rounded-xl border border-gray-800/50">
             <label className="text-xs text-[#00A3FF] mb-1 block font-bold">Exit Price (Close Trade)</label>
             <input 
                name="exitPrice" 
                type="number" 
                step="any" 
                defaultValue={tradeToEdit?.exitPrice || ''}
                placeholder="Leave empty if OPEN" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00A3FF] outline-none" 
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Stop Loss</label>
              <input 
                name="stopLoss" 
                type="number" 
                step="any" 
                defaultValue={tradeToEdit?.stopLoss || ''}
                placeholder="Optional" 
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none" 
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
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 mt-4 rounded-xl font-bold text-black transition-all ${
              type === 'LONG' ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'
            }`}
          >
            {loading ? <Loader2 className="animate-spin mx-auto"/> : (tradeToEdit ? 'Save Changes' : (type === 'LONG' ? 'Open Long' : 'Open Short'))}
          </button>

        </form>
      </div>
    </div>
  );
}