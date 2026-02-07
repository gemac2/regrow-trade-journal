// app/(main)/trades/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getTrades, deleteTrade } from '@/app/actions';
import { TradeModal } from '@/components/TradeModal';
import { Plus, Trash2, TrendingUp, TrendingDown, Search, Pencil } from 'lucide-react'; // Import Pencil

export default function TradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  
  // State for Modal and Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<any>(null); // Holds the trade being edited
  
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) loadTrades(user.id);
  }, [user]);

  async function loadTrades(userId: string) {
    setLoadingData(true);
    const { success, data } = await getTrades(userId);
    if (success && data) setTrades(data);
    setLoadingData(false);
  }

  async function handleDelete(id: number) {
    if(!confirm("Delete this trade?")) return;
    await deleteTrade(id);
    if (user) loadTrades(user.id);
  }

  // Handle opening modal for EDIT
  function handleEdit(trade: any) {
    setTradeToEdit(trade); // Set data
    setIsModalOpen(true);  // Open modal
  }

  // Handle opening modal for CREATE
  function handleCreate() {
    setTradeToEdit(null); // Clear data
    setIsModalOpen(true); // Open modal
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Trade Log</h1>
          <p className="text-gray-400">Manage and review your trading history.</p>
        </div>
        <button 
          onClick={handleCreate} // Use handleCreate
          className="flex items-center gap-2 bg-[#00FF7F] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00e676] transition shadow-[0_0_20px_rgba(0,255,127,0.2)]"
        >
          <Plus size={18} /> Add Trade
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1e2329] p-4 rounded-xl border border-gray-800 flex gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by symbol..." 
              className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#00A3FF] outline-none"
            />
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e2329] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#13171D] text-gray-200 uppercase font-medium border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Entry</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Exit</th>
                <th className="px-6 py-4">PnL</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loadingData ? (
                 <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Loading data...</td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No trades registered.</td></tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-[#252b33] transition-colors group">
                    <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(trade.entryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                        trade.type === 'LONG' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {trade.type === 'LONG' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-300">${Number(trade.entryPrice).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono">{Number(trade.size).toFixed(3)}</td>
                    <td className="px-6 py-4 font-mono text-gray-300">
                      {trade.exitPrice ? `$${Number(trade.exitPrice).toFixed(2)}` : '-'}
                    </td>
                    <td className={`px-6 py-4 font-mono font-bold ${
                      Number(trade.pnl) > 0 ? 'text-[#00FF7F]' : Number(trade.pnl) < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {trade.pnl ? `${Number(trade.pnl) > 0 ? '+' : ''}$${Number(trade.pnl).toFixed(2)}` : 'OPEN'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => handleEdit(trade)}
                        className="text-gray-600 hover:text-[#00A3FF] transition"
                        title="Edit / Close"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(trade.id)}
                        className="text-gray-600 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {user && (
        <TradeModal 
            userId={user.id} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            tradeToEdit={tradeToEdit} // Pass the trade to edit
        />
      )}
    </div>
  );
}