// app/(main)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { AccountProvider } from '@/app/context/AccountContext'; 
import { OnboardingModal } from '@/components/OnboardingModal'; 
import { Menu } from 'lucide-react'; // Icono de hamburguesa
import { Logo } from '@/components/Logo'; // Logo para el header móvil

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  
  // Estado para controlar la apertura del Sidebar en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return null; 

  return (
    <AccountProvider>
      <div className="min-h-screen bg-[#05070A] flex flex-col md:flex-row relative">
        
        {/* Modal de bienvenida (si aplica) */}
        <OnboardingModal />

        {/* 1. HEADER MÓVIL (Solo visible en pantallas pequeñas 'md:hidden') */}
        <div className="md:hidden sticky top-0 z-30 bg-[#0B0E11]/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-[65px]">
          <div className="scale-75 origin-left">
            <Logo />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* 2. SIDEBAR RESPONSIVO */}
        {/* Le pasamos el estado y la función para cerrar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* 3. CONTENIDO PRINCIPAL */}
        {/* - En móvil: w-full, sin margen izquierdo (ml-0), altura calculada restando el header.
            - En desktop: margen izquierdo de 64 (md:ml-64) para respetar el sidebar fijo.
        */}
        <main className="flex-1 w-full md:ml-64 p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
          <div className="max-w-7xl mx-auto pb-20 md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </AccountProvider>
  );
}