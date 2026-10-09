'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/app/lib/auth';
import { Logo } from '@/components/Logo';
import { Mail, Lock, User, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialView = searchParams.get('view') === 'register' ? false : true;

  const [isLoginView, setIsLoginView] = useState(initialView); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (searchParams.get('view') === 'register') {
      setIsLoginView(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isLoginView) {
        const { error } = await authClient.signIn.email({
          email, password, callbackURL: '/dashboard', 
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await authClient.signUp.email({
          email, password, name, callbackURL: '/dashboard',
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = (err instanceof Error ? err.message : null) || (isLoginView ? "Credenciales inválidas." : "Error al registrarse.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-300"> 
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="scale-90 mb-1"> 
          <Logo />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Trading Journal Pro</h1>
          <p className="text-xs text-slate-400">Terminal institucional de registro y análisis</p>
        </div>
      </div>

      {/* Glowing Card Container */}
      <div className="w-full rounded-3xl border border-white/[0.12] bg-[#121824]/90 p-7 backdrop-blur-2xl shadow-2xl relative">
        
        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 p-1 bg-[#0D1117] rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setIsLoginView(true)}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isLoginView 
                ? 'bg-gradient-to-r from-[#00E599]/20 to-[#00A3FF]/10 text-white border border-[#00E599]/30 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsLoginView(false)}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isLoginView 
                ? 'bg-gradient-to-r from-[#00A3FF]/20 to-[#00E599]/10 text-white border border-[#00A3FF]/30 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs font-medium text-rose-300 animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLoginView && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300">Nombre Completo</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={17} />
                </div>
                <input
                  id="name"
                  type="text"
                  required={!isLoginView}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-white/[0.08] bg-[#0D1117] py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#00E599] outline-none transition-all"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail size={17} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-white/[0.08] bg-[#0D1117] py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#00E599] outline-none transition-all"
                placeholder="trader@regrow.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-300">Contraseña</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-white/[0.08] bg-[#0D1117] py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#00E599] outline-none transition-all"
                placeholder="••••••••"
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#00E599] to-[#00c985] py-3 text-sm font-bold text-slate-950 transition-all hover:brightness-105 shadow-[0_0_20px_rgba(0,229,153,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <span>{isLoginView ? 'Acceder al Dashboard' : 'Crear Cuenta'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={14} className="text-[#00E599]" />
        <span>Autenticación y cifrado en base de datos Neon</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#080B11] p-4 text-white relative overflow-hidden">
      {/* Luces difusas de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-gradient-to-b from-[#00E599]/10 to-[#00A3FF]/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      
      <Suspense fallback={<div className="text-[#00E599] font-bold animate-pulse text-sm">Cargando interfaz...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}