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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-[#121824] p-6 shadow-[0_0_50px_-10px_rgba(244,63,94,0.3)] relative animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition disabled:opacity-50 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Icono de Alerta */}
          <div className="w-14 h-14 bg-rose-500/15 rounded-2xl flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="text-rose-400" size={28} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">¿Eliminar Operación?</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este registro de trade? <br/>
              <span className="text-rose-400 font-medium">Esta acción no se puede deshacer.</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-2.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-slate-300 font-semibold hover:bg-white/[0.06] transition disabled:opacity-50 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(244,63,94,0.35)] text-xs cursor-pointer"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={15} /> Eliminar</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}