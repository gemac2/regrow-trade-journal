import Link from 'next/link';
import { ArrowRight, BarChart2, Globe, Layers } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 overflow-x-hidden selection:bg-[#00E599]/30 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#080B11]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="scale-90 origin-left">
            <Logo />
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:block text-sm font-semibold text-slate-400 hover:text-white transition"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/login?view=register" 
              className="bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:brightness-105 transition shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_30px_rgba(0,229,153,0.5)]"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Ambient Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#00E599]/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-[#00A3FF]/10 rounded-full blur-[130px] -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-[#00A3FF]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A3FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A3FF]"></span>
            </span>
            v2.0 Terminal Institucional & Modo Cobertura Activo
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Bitácora de Trading. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] via-[#00c985] to-[#00A3FF]">
              Domina tu Ventaja Operativa.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            El diario de trading diseñado para traders de alto rendimiento. Control de PnL cuantitativo, 
            <span className="text-white font-semibold"> gestión avanzada de coberturas (Hedge Mode)</span> y métricas institucionales en un único panel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/login?view=register" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 rounded-2xl font-bold text-base hover:brightness-105 transition flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,229,153,0.35)]"
            >
              Comenzar a Registrar <ArrowRight size={18} />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-[#121824] border border-white/[0.12] text-white rounded-2xl font-bold text-base hover:bg-[#182030] hover:border-white/[0.2] transition"
            >
              Acceder al Terminal
            </Link>
          </div>
        </div>

        {/* Feature Highlights Mockup Card */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00E599] to-[#00A3FF] rounded-3xl blur opacity-20"></div>
          <div className="relative bg-[#121824] border border-white/[0.12] rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0D1117] p-5 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
                  <BarChart2 size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Curva de Crecimiento</h3>
                <p className="text-xs text-slate-400">Evolución de saldo acumulado, PnL neto en tiempo real y drawdown calculado automáticamente.</p>
              </div>

              <div className="bg-[#0D1117] p-5 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Sistema Hedge Risk Desk</h3>
                <p className="text-xs text-slate-400">Control específico de coberturas activas, cálculo de pérdida congelada y reducción de riesgo real.</p>
              </div>

              <div className="bg-[#0D1117] p-5 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Globe size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Multi-Cuenta Dinámico</h3>
                <p className="text-xs text-slate-400">Gestiona brokers, empresas de fondeo (Prop Firms) y cuentas personales de manera aislada.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-24 px-6 relative overflow-hidden border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#121824] via-[#161D2B] to-[#121824] rounded-3xl p-10 md:p-16 text-center border border-white/[0.1] relative z-10 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">¿Listo para profesionalizar tu operativa?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Elimina la improvisación. Regrow Trade Journal te da la claridad matemática y cuantitativa que necesitas.
          </p>
          <Link 
            href="/login?view=register" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E599] to-[#00c985] text-slate-950 px-8 py-4 rounded-xl text-base font-bold hover:brightness-105 transition shadow-[0_0_30px_rgba(0,229,153,0.35)]"
          >
            Crear mi Cuenta Gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#080B11]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="scale-75 origin-left">
              <Logo />
            </div>
            <span className="text-slate-500 text-xs">© 2026 Regrow Code. Todos los derechos reservados.</span>
          </div>
          
          <div className="flex gap-6 text-xs text-slate-500">
            <span className="hover:text-white transition">Privacidad</span>
            <span className="hover:text-white transition">Términos</span>
            <span className="hover:text-white transition">Soporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}