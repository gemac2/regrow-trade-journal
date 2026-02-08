// components/Sidebar.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { authClient } from '@/app/lib/auth';
import { useAccount } from '@/app/context/AccountContext';
import { useAuth } from '@/app/hooks/useAuth';
import { 
  LayoutDashboard, 
  ListOrdered, 
  LogOut, 
  User, 
  ChevronDown, 
  PlusCircle, 
  Wallet,
  Check,
  Settings,
  X // Importamos icono de cerrar para móvil
} from 'lucide-react';
import { Logo } from './Logo'; 
import { CreateAccountModal } from './CreateAccountModal';

// Definimos las props para controlar el estado en móvil
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { accounts, selectedAccount, switchAccount } = useAccount();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', path: '/trades', icon: ListOrdered },
  ];

  // Cerrar el menú automáticamente cuando cambiamos de página en móvil
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Cerrar dropdown de cuentas si clicamos fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* 0. OVERLAY OSCURO (Solo visible en móvil cuando el menú está abierto) */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ASIDE PRINCIPAL CON TRANSICIÓN PARA MÓVIL */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#0B0E11] border-r border-gray-800 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        
        {/* 1. LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/50 relative">
            <div className="scale-75 origin-left">
                <Logo /> 
            </div>
            {/* Botón Cerrar (Solo visible en móvil) */}
            <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white">
              <X size={24} />
            </button>
        </div>

        {/* 2. ACCOUNT SELECTOR */}
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
                            setIsDropdownOpen(false);
                            setIsCreateModalOpen(true);
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

        {/* 3. NAVIGATION MENU */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
            <p className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Menu</p>
            {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
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
                <Icon 
                    size={20} 
                    className={isActive ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-white'} 
                />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_5px_#00FF7F]"></div>
                )}
                </Link>
            );
            })}
        </nav>

        {/* 4. USER PROFILE SECTION */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1116]">
            {user ? (
                <div className="relative group">
                    <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1e2329] transition-colors w-full text-left mb-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF7F] to-[#00A3FF] p-[1px]">
                            <div className="w-full h-full rounded-full bg-[#0b0e11] flex items-center justify-center overflow-hidden">
                                 {user.image ? (
                                    <img src={user.image} alt="User" className="w-full h-full object-cover" />
                                 ) : (
                                    <User size={18} className="text-gray-400" />
                                 )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider font-bold">Pro Trader</p>
                        </div>
                        <Settings size={16} className="text-gray-600 group-hover:text-[#00FF7F] transition-colors" />
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-red-400 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={14} /> Log Out
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-800"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-20 bg-gray-800 rounded"></div>
                        <div className="h-2 w-12 bg-gray-800 rounded"></div>
                    </div>
                </div>
            )}
        </div>
      </aside>

      <CreateAccountModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}