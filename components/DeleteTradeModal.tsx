// components/DeleteTradeModal.tsx
'use client';

import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteTradeModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteTradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#1e2329] p-6 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)] relative scale-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Icono de Alerta */}
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="text-red-500" size={32} />
          </div>

          <h3 className="text-xl font-bold text-white">Delete Trade?</h3>
          
          <p className="text-gray-400 text-sm">
            Are you sure you want to remove this trade record? <br/>
            <span className="text-red-400 font-medium">This action cannot be undone.</span>
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-3 rounded-xl bg-[#0b0e11] border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18} /> Delete</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}