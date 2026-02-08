'use client';
import { useState, useEffect } from 'react';
import { authClient } from '@/app/lib/auth';

export function useAuth() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        // CAMBIO AQUÍ: Usamos getSession() en lugar de getUser()
        const { data, error } = await authClient.getSession();
        
        if (data?.user) {
          setUser(data.user);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } catch (e) {
        console.error("Error verificando sesión:", e);
        setStatus('unauthenticated');
      }
    }

    checkAuth();
  }, []);

  return { status, user };
}