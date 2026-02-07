// app/(main)/trades/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useAccount } from '@/app/context/AccountContext'; // Import Account Context
import { getTrades, deleteTrade } from '@/app/actions';
import { TradeModal } from '@/components/TradeModal';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Pencil, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader2 
} from 'lucide-react';

export default function TradesPage() {
  const { user } = useAuth();
  const { selectedAccount, isLoading: isAccountLoading } = useAccount(); // Get selected account
  
  const [trades, setTrades] = useState<any[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // --- FILTERS & PAGINATION STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load trades when User OR Selected Account changes
  useEffect(() => {
    if (user && selectedAccount) {
      loadTrades(user.id, selectedAccount.id);
    }
  }, [user, selectedAccount]);

  async function loadTrades(userId: string, accountId: number) {
    setLoadingData(true);
    // Fetch trades specific to this account
    const { success, data } = await getTrades(userId, accountId);
    if (success && data) setTrades(data);
    else setTrades([]); // Clear trades if fetch fails or empty
    setLoadingData(false);
  }

  async function handleDelete(id: number) {
    if(!confirm("Delete this trade?")) return;
    await deleteTrade(id);
    // Reload using current selected account
    if (user && selectedAccount) loadTrades(user.id, selectedAccount.id);
  }

  function handleEdit(trade: any) {
    setTradeToEdit(trade);
    setIsModalOpen(true);
  }

  function handleCreate() {
    setTradeToEdit(null);
    setIsModalOpen(true);
  }

  // --- FILTERING LOGIC ---
  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || trade.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrades = filteredTrades.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);


  // If account context is loading or no account selected, show loader
  if (isAccountLoading || !selectedAccount) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader2 className="animate-spin text-[#00FF7F]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            {selectedAccount.name} <span className="text-gray-600 text-lg font-normal">Trade Log</span>
          </h1>
          <p className="text-gray-400">Manage and review your trading history.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#00FF7F] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00e676] transition shadow-[0_0_20px_rgba(0,255,127,0.2)]"
        >
          <Plus size={18} /> Add Trade
        </button>
      </div>

      {/* --- CONTROLS BAR (Search & Filters) --- */}
      <div className="bg-[#1e2329] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4">
         
         {/* Search Input */}
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search symbol (e.g. BTC)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#00A3FF] outline-none transition-colors"
            />
         </div>

         {/* Type Filter Dropdown */}
         <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#00A3FF] outline-none appearance-none cursor-pointer"
            >
                <option value="ALL">All Types</option>
                <option value="LONG">Longs Only</option>
                <option value="SHORT">Shorts Only</option>
            </select>
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e2329] rounded-2xl border border-gray-800 overflow-hidden shadow-xl flex flex-col">
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
              ) : currentTrades.length === 0 ? (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm || filterType !== 'ALL' ? 'No trades match your filters.' : 'No trades registered for this account.'}
                    </td>
                </tr>
              ) : (
                currentTrades.map((trade) => (
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
                      <button 
                        onClick={() => handleEdit(trade)}
                        className="text-gray-600 hover:text-[#00A3FF] transition"
                        title="Edit / Close"
                      >
                        <Pencil size={16} />
                      </button>
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

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
            <div className="bg-[#13171D] border-t border-gray-800 p-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTrades.length)} of {filteredTrades.length} entries
                </span>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-[#0b0e11] border border-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    <span className="text-sm font-mono text-gray-400">
                        Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-[#0b0e11] border border-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {user && selectedAccount && (
        <TradeModal 
            userId={user.id}
            accountId={selectedAccount.id} // PASS ACCOUNT ID HERE
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); loadTrades(user.id, selectedAccount.id); }} 
            tradeToEdit={tradeToEdit} 
        />
      )}
    </div>
  );
}