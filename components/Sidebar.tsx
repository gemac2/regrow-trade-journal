// components/Sidebar.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { authClient } from '@/app/lib/auth';
import { useAccount } from '@/app/context/AccountContext';
import { 
  LayoutDashboard, 
  Table2, 
  LogOut, 
  UserCircle, 
  ChevronDown, 
  PlusCircle, 
  Wallet,
  Check
} from 'lucide-react';
import { Logo } from './Logo'; 
import { CreateAccountModal } from './CreateAccountModal'; // <--- 1. IMPORTAR

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { accounts, selectedAccount, switchAccount } = useAccount(); // Ya no necesitamos createNewAccount aquí directo
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 2. NUEVO ESTADO PARA EL MODAL
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', path: '/trades', icon: Table2 },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <> 
      {/* Envolvemos en Fragment para poner el Modal al mismo nivel que el aside */}
      
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B0E11] border-r border-gray-800 flex flex-col z-40">
        
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800/50">
            <div className="scale-75">
                <Logo /> 
            </div>
        </div>

        {/* ACCOUNT SELECTOR */}
        <div className="px-3 pt-6 pb-2" ref={dropdownRef}>
            <div className="relative">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#13171D] border border-gray-800 hover:border-gray-600 hover:bg-[#1c222b] text-white p-3 rounded-xl flex items-center justify-between transition-all group"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-gradient-to-br from-[#00FF7F]/20 to-[#00A3FF]/20 p-2 rounded-lg text-[#00FF7F] border border-[#00FF7F]/10 group-hover:border-[#00FF7F]/30 transition">
                    <Wallet size={18} />
                </div>
                <div className="text-left overflow-hidden">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Account</p>
                    <p className="text-sm font-bold truncate w-28 text-white">
                        {selectedAccount?.name || 'Loading...'}
                    </p>
                </div>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1e2329] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-48 overflow-y-auto py-1">
                    {accounts.map(acc => (
                        <button
                        key={acc.id}
                        onClick={() => { switchAccount(acc.id); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition flex items-center justify-between group
                            ${selectedAccount?.id === acc.id ? 'bg-white/5' : ''}`}
                        >
                        <div className="flex flex-col">
                            <span className={selectedAccount?.id === acc.id ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}>
                                {acc.name}
                            </span>
                            <span className="text-xs text-gray-600 font-mono">${Number(acc.initialBalance).toLocaleString()}</span>
                        </div>
                        
                        {selectedAccount?.id === acc.id && <Check size={14} className="text-[#00FF7F]" />}
                        </button>
                    ))}
                </div>
                
                <div className="border-t border-gray-700 p-1">
                    <button
                        onClick={() => {
                            setIsDropdownOpen(false); // Cerramos dropdown
                            setIsCreateModalOpen(true); // 3. ABRIMOS MODAL
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#00A3FF] hover:bg-[#00A3FF]/10 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        <PlusCircle size={14} /> ADD NEW ACCOUNT
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
            <p className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Menu</p>
            {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
                <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                    ? 'bg-gradient-to-r from-[#00FF7F]/10 to-[#00A3FF]/10 text-white border border-[#00FF7F]/20' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
                >
                <item.icon 
                    size={20} 
                    className={isActive ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-white'} 
                />
                <span className="font-medium">{item.name}</span>
                </Link>
            );
            })}
        </nav>

        {/* USER & LOGOUT */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1116]">
            <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00FF7F] to-[#00A3FF] flex items-center justify-center text-black font-bold shadow-lg shadow-blue-500/20">
                <UserCircle size={22} />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate w-32">{userEmail || 'Trader'}</p>
                <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
            </div>

            <button
            onClick={async () => {
                await authClient.signOut();
                router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition text-sm font-medium"
            >
            <LogOut size={16} /> Log Out
            </button>
        </div>
      </aside>

      {/* 4. RENDERIZAMOS EL MODAL AQUÍ */}
      <CreateAccountModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}