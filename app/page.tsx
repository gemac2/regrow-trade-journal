'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LogoutButton from '@/components/LogoutButton';
export default function Dashboard() {
  const { status } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center text-white bg-slate-950">Cargando datos...</div>;
  }

  // Si no está autenticado, no mostramos nada mientras redirige
  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <nav className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-blue-500">RegrowTrade Dashboard</h1>
        {/* Si creaste el botón de logout, úsalo aquí. Si no, puedes poner un texto temporal */}
        <button onClick={() => router.push('/login')} className="text-sm text-red-400">Cerrar Sesión (Temp)</button>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-slate-400 mb-2">Balance Actual</h3>
          <p className="text-3xl font-mono font-bold">$200.00</p>
        </div>
        {/* Aquí irán el resto de tus stats */}
      </div>
    </div>
  );
}