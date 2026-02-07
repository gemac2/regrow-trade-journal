'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/app/lib/auth';
import { Logo } from '@/components/Logo';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isLoginView) {
        const { error } = await authClient.signIn.email({
          email, password, callbackURL: '/', 
        });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await authClient.signUp.email({
          email, password, name, callbackURL: '/',
        });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || (isLoginView ? "Invalid credentials." : "Registration failed.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#05070A] bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] p-4 font-sans text-white selection:bg-blue-500/30">
      
      {/* CAMBIO: Reduje 'space-y-12' a 'space-y-6' para acercar la tarjeta al logo */}
      <div className="flex w-full max-w-[420px] flex-col items-center space-y-6"> 
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">
          
          {/* Contenedor del Logo con margen negativo inferior para "comerse" el espacio vacío de la imagen */}
          <div className="-mt-[70px]"> 
            <Logo />
          </div>

          {/* CAMBIO: Texto más pequeño (3xl) y con menos margen superior */}
          <h1 className="text-3xl font-bold tracking-tight -mt-[70px] text-white">Trading Journal</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, trader.</p>
        </div>

        {/* Glowing Card Container */}
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-r from-[#00FF7F] to-[#00A3FF] shadow-[0_0_40px_-10px_rgba(0,255,127,0.3),0_0_40px_-10px_rgba(0,163,255,0.3)]">
          <div className="h-full w-full rounded-[23px] bg-[#0B0E11]/95 p-8 backdrop-blur-xl border border-white/5">
            
            {/* Tabs */}
            <div className="mb-8 flex border-b border-gray-800/50">
              <button
                onClick={() => setIsLoginView(true)}
                className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                  isLoginView ? 'text-[#00FF7F]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Login
                {isLoginView && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#00FF7F] shadow-[0_-2px_10px_rgba(0,255,127,0.5)]"></div>}
              </button>
              <button
                onClick={() => setIsLoginView(false)}
                className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                  !isLoginView ? 'text-[#00A3FF]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Register
                {!isLoginView && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#00A3FF] shadow-[0_-2px_10px_rgba(0,163,255,0.5)]"></div>}
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400">
                {errorMessage}
              </div>
            )}

            {/* Formulario más compacto (space-y-5) */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {!isLoginView && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="name" className="text-xs font-medium text-gray-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#00A3FF] transition-colors" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required={!isLoginView}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-xl border border-gray-800/80 bg-[#13171D]/80 py-3 pl-12 text-sm text-white placeholder-gray-600 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] focus:outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-gray-400 ml-1">Email</label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#00A3FF] transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-gray-800/80 bg-[#13171D]/80 py-3 pl-12 text-sm text-white placeholder-gray-600 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] focus:outline-none transition-all"
                    placeholder="trader@regrow.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-medium text-gray-400 ml-1">Password</label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00A3FF] transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-gray-800/80 bg-[#13171D]/80 py-3 pl-12 text-sm text-white placeholder-gray-600 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] focus:outline-none transition-all"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#00FF7F] to-[#00A3FF] py-3 text-base font-bold text-black transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,255,127,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLoginView ? 'Login' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}