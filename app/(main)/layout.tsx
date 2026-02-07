// app/(main)/layout.tsx
'use client';
import { useAuth } from '@/app/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return null; // O tu spinner de carga

  return (
    <div className="min-h-screen bg-[#05070A] flex">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar userEmail={user?.email} />
      
      {/* Contenido principal a la derecha */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}