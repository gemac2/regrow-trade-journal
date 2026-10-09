// app/(main)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { AccountProvider, useAccount } from '@/app/context/AccountContext'; 
import { OnboardingModal } from '@/components/OnboardingModal'; 
import { Menu, Wallet, Activity, Shield } from 'lucide-react'; 
import { Logo } from '@/components/Logo'; 

function TopNavHeader({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const pathname = usePathname();
  const { selectedAccount } = useAccount();

  const getPageTitle = () => {
    if (pathname.includes('/trades')) return 'Bitácora de Operaciones';
    if (pathname.includes('/profile')) return 'Perfil del Trader';
    return 'Panel de Rendimiento (Dashboard)';
  };

  return (
    <>
      {/* 1. HEADER MÓVIL (Solo pantallas pequeñas) */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0D1117]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 flex justify-between items-center h-[64px]">
        <div className="scale-75 origin-left">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          {selectedAccount && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#121824] text-slate-200 border border-white/[0.08] truncate max-w-[120px]">
              {selectedAccount.name}
            </span>
          )}
          <button 
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* 2. HEADER DESKTOP (Sleek ambient bar) */}
      <header className="hidden md:flex sticky top-0 z-20 h-16 bg-[#080B11]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Regrow Trade</span>
            <span className="text-slate-600">/</span>
            <span className="text-[#00E599] font-medium">{getPageTitle()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121824]/80 border border-white/[0.06] text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]"></span>
            </span>
            <span className="font-medium text-slate-200">Terminal Sincronizado</span>
          </div>

          {selectedAccount && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121824] border border-white/[0.08] text-xs">
              <Wallet size={13} className="text-[#00A3FF]" />
              <span className="font-medium text-slate-300">{selectedAccount.name}</span>
              <span className="text-[10px] font-mono text-[#00E599] font-bold bg-[#00E599]/10 px-1.5 py-0.2 rounded border border-[#00E599]/20">
                ${Number(selectedAccount.initialBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return null; 

  return (
    <AccountProvider>
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col md:flex-row relative selection:bg-[#00E599]/30 selection:text-white">
        
        {/* Modal de bienvenida / Onboarding */}
        <OnboardingModal />

        {/* SIDEBAR RESPONSIVO */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* CONTENIDO PRINCIPAL CON TOPBAR */}
        <div className="flex-1 w-full md:ml-64 flex flex-col min-h-screen">
          <TopNavHeader onOpenMobileMenu={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto pb-16 md:pb-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AccountProvider>
  );
}