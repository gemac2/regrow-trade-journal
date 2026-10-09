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
  Plus, 
  Wallet,
  Check,
  Settings,
  X
} from 'lucide-react';
import { Logo } from './Logo'; 
import { CreateAccountModal } from './CreateAccountModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { accounts, selectedAccount, switchAccount, currentBalance } = useAccount();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Operaciones', path: '/trades', icon: ListOrdered, badge: null },
    { name: 'Mi Perfil', path: '/profile', icon: User, badge: null },
  ];

  // Cerrar el menú automáticamente al cambiar de ruta en móvil
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Cerrar dropdown si se hace click afuera
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
      {/* Overlay oscuro móvil */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-md transition-opacity duration-300"
        />
      )}

      {/* ASIDE PRINCIPAL */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#0D1117] border-r border-white/[0.08] flex flex-col z-50
        transition-transform duration-300 ease-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        
        {/* 1. BRAND HEADER */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/[0.06] relative">
          <div className="flex items-center gap-2.5">
            <div className="scale-75 origin-left">
              <Logo /> 
            </div>
          </div>
          
          {/* Botón cerrar en móvil */}
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            aria-label="Cerrar navegación"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. ACCOUNT SELECTOR */}
        <div className="px-3.5 pt-4 pb-2" ref={dropdownRef}>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#121824] hover:bg-[#182030] border border-white/[0.08] hover:border-white/[0.15] text-slate-100 p-3 rounded-xl flex items-center justify-between transition-all duration-200 group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3 overflow-hidden text-left">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E599]/20 to-[#00A3FF]/20 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] shrink-0">
                  <Wallet size={16} />
                </div>
                <div className="overflow-hidden flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                      Cuenta Activa
                    </span>
                    {selectedAccount && (
                      <span className="text-[10px] font-mono font-bold text-[#00E599] shrink-0" title="Saldo Actual">
                        ${Number(currentBalance || selectedAccount.initialBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold truncate block text-white group-hover:text-[#00E599] transition-colors">
                    {selectedAccount?.name || 'Cargando...'}
                  </span>
                </div>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} 
              />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1.5 bg-[#161D2B] border border-white/[0.12] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tus Cuentas</span>
                  <span className="text-[10px] font-mono text-slate-400">{accounts.length} reg.</span>
                </div>
                <div className="max-h-52 overflow-y-auto py-1 divide-y divide-white/[0.03]">
                  {accounts.map(acc => {
                    const isSelected = selectedAccount?.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => { switchAccount(acc.id); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-white/[0.06] transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected ? 'bg-white/[0.04]' : ''
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className={`font-medium truncate ${isSelected ? 'text-[#00E599] font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                            {acc.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ${Number(acc.initialBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#00E599]/20 text-[#00E599] flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="border-t border-white/[0.08] p-1.5 bg-[#121824]">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#00A3FF] hover:text-white hover:bg-[#00A3FF]/15 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} /> Nueva Cuenta de Trading
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. NAVIGATION MENU */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menú Principal
            </span>
          </div>

          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#00E599]/15 to-[#00A3FF]/5 text-white font-semibold border border-[#00E599]/25 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#00E599]/20 text-[#00E599]' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599]"></span>
                  </div>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Atajos y Estado
            </span>
          </div>
          
          <div className="px-3 py-2.5 rounded-xl bg-[#121824]/60 border border-white/[0.04] text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></span>
                Servidor Neon DB
              </span>
              <span className="text-[10px] font-mono text-[#00E599]">Activo</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-slate-400">Modo Cobertura</span>
              <span className="text-[10px] font-bold text-[#00A3FF] bg-[#00A3FF]/10 px-1.5 py-0.2 rounded">Hedge v2</span>
            </div>
          </div>
        </nav>

        {/* 4. USER PROFILE & LOGOUT SECTION */}
        <div className="p-3 border-t border-white/[0.06] bg-[#0C1017]">
          {user ? (
            <div className="space-y-1.5">
              <Link 
                href="/profile" 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition-all group w-full text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00E599] to-[#00A3FF] p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#0D1117] flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt="Usuario" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-slate-300" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#00E599] transition-colors">
                    {user.name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00E599]"></span>
                    Trader Verificado
                  </p>
                </div>
                <Settings size={15} className="text-slate-400 group-hover:text-white transition-colors" />
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 py-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={13} /> Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-800"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 bg-slate-800 rounded"></div>
                <div className="h-2 w-12 bg-slate-800 rounded"></div>
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