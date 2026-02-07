import Link from 'next/link';
import { ArrowRight, BarChart2, Shield, Zap, Globe, Layout, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo'; // Asegúrate de tener este componente accesible o importalo

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070A] text-white overflow-x-hidden selection:bg-[#00FF7F] selection:text-black">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#05070A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="scale-90 origin-left">
            <Logo />
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Log in
            </Link>
            <Link 
              href="/login?view=register" 
              className="bg-[#00FF7F] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00e676] transition shadow-[0_0_20px_rgba(0,255,127,0.3)] hover:shadow-[0_0_30px_rgba(0,255,127,0.5)]"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00FF7F]/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00A3FF]/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#00A3FF]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A3FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A3FF]"></span>
            </span>
            v1.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Journal your trades. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF7F] to-[#00A3FF]">
              Master your edge.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The ultimate trading journal for serious traders. Track performance across 
            <span className="text-white font-medium"> Binance, Bybit, and Prop Firms</span> in one unified dashboard.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/login?view=register" 
              className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              Start Tracking Now <ArrowRight size={20} />
            </Link>
            <Link 
              href="/login" 
              className="w-full md:w-auto px-8 py-4 bg-[#1e2329] border border-gray-800 text-white rounded-xl font-bold text-lg hover:bg-[#2a3038] hover:border-gray-700 transition"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Hero Image / Dashboard Mockup */}
        <div className="mt-20 relative max-w-6xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF7F] to-[#00A3FF] rounded-2xl blur opacity-20"></div>
          <div className="relative bg-[#0B0E11] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] flex items-center justify-center group">
             {/* Aquí podrías poner una imagen real luego */}
             <div className="text-center">
                <Layout size={64} className="mx-auto text-gray-700 mb-4 group-hover:text-[#00FF7F] transition duration-500" />
                <img src="/dashboard-mockup.png" alt="App Interface" className="w-full h-full object-cover" />
             </div>
             
             {/* Floating Badge Example */}
             <div className="absolute top-10 right-10 bg-[#1e2329]/90 backdrop-blur border border-gray-700 p-4 rounded-xl shadow-xl animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                      <Zap size={20} />
                   </div>
                   <div>
                      <p className="text-xs text-gray-400">Win Rate</p>
                      <p className="text-xl font-bold text-white">68.5%</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-[#0B0E11]/50 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Profitability</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stop trading blindly. Our tools give you the data you need to identify what's working and cut what isn't.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-[#13171D] border border-gray-800 hover:border-[#00FF7F]/50 transition group cursor-default">
              <div className="w-12 h-12 bg-[#00FF7F]/10 rounded-xl flex items-center justify-center text-[#00FF7F] mb-6 group-hover:scale-110 transition">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Multi-Account Sync</h3>
              <p className="text-gray-400 leading-relaxed">
                Manage all your accounts in one place. Whether it's Binance Futures, Bybit, or a Funded Account, we handle the complexity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-[#13171D] border border-gray-800 hover:border-[#00A3FF]/50 transition group cursor-default">
              <div className="w-12 h-12 bg-[#00A3FF]/10 rounded-xl flex items-center justify-center text-[#00A3FF] mb-6 group-hover:scale-110 transition">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Advanced Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Visualize your Equity Curve, Win Rate, and Profit Factor instantly. Detect your strengths with professional-grade charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-[#13171D] border border-gray-800 hover:border-purple-500/50 transition group cursor-default">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Bank-Grade Security</h3>
              <p className="text-gray-400 leading-relaxed">
                Your data is yours. We use IDOR protection and AES-256 encryption to ensure your trading strategies remain private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-24 px-6 relative overflow-hidden">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#1e2329] to-[#13171D] rounded-3xl p-12 md:p-20 text-center border border-gray-800 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to level up your trading?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join hundreds of traders who are already using Regrow Code to refine their edge.
            </p>
            <Link 
              href="/login?view=register" 
              className="inline-flex items-center gap-2 bg-[#00FF7F] text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#00e676] transition shadow-[0_0_30px_rgba(0,255,127,0.3)]"
            >
              Get Started for Free <ArrowRight size={20} />
            </Link>
         </div>
         {/* Glow behind box */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-[#00A3FF]/20 blur-[120px] -z-0" />
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-900 py-12 bg-[#020305]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="opacity-50 grayscale hover:grayscale-0 transition">
                <Logo />
            </div>
            <span className="text-gray-600 text-sm">© 2026 Regrow Code. All rights reserved.</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500">
             <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
             <Link href="#" className="hover:text-white transition">Terms of Service</Link>
             <Link href="#" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}