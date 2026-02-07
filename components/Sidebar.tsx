// components/Sidebar.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/app/lib/auth';
import { LayoutDashboard, Table2, LogOut, UserCircle } from 'lucide-react';
import { Logo } from './Logo'; // Asegúrate de que este componente exporte tu imagen

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', path: '/trades', icon: Table2 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B0E11] border-r border-gray-800 flex flex-col z-40">
      
      {/* LOGO AREA */}
      <div className="h-24 flex items-center justify-center border-b border-gray-800/50">
        <div className="scale-75">
             <Logo /> 
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 py-6 px-3 space-y-2">
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
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_8px_#00FF7F]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER & LOGOUT */}
      <div className="p-4 border-t border-gray-800 bg-[#0d1116]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF7F] to-[#00A3FF] flex items-center justify-center text-black font-bold">
            <UserCircle size={20} />
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
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}