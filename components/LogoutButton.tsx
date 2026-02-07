'use client';
import { useRouter } from 'next/navigation';
import { authClient } from '@/app/lib/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login'); // Te regresa al login
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-red-900/30 bg-red-900/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 transition"
    >
      Cerrar Sesión
    </button>
  );
}