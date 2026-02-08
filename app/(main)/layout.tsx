// app/(main)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { AccountProvider } from '@/app/context/AccountContext'; // Importar Contexto
import { OnboardingModal } from '@/components/OnboardingModal'; // Importar Modal de Bienvenida

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return null; 

  return (
    /* 1. Envolvemos toda la estructura principal con el Proveedor de Cuentas */
    <AccountProvider>
      <div className="min-h-screen bg-[#05070A] flex relative">
        
        {/* 2. El Modal de Onboarding (Se mostrará solo si no hay cuentas) */}
        <OnboardingModal />

        {/* Sidebar fijo a la izquierda */}
        <Sidebar/>
        
        {/* Contenido principal a la derecha */}
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AccountProvider>
  );
}