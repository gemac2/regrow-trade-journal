'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/app/actions';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Save, 
  Loader2, 
  Mail, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const { user, status } = useAuth();
  const authLoading = status === "loading";
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    bio: '',
    tradingStyle: 'Day Trader',
    location: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        setLoadingData(true);
        const result = await getUserProfile(user.id);
        
        if (result.success && result.data) {
          setFormData({
            bio: result.data.bio || '',
            tradingStyle: result.data.tradingStyle || 'Day Trader',
            location: result.data.location || '',
          });
        }
        setLoadingData(false);
      }
    }

    if (!authLoading && user) {
      loadProfile();
    }
  }, [user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setNotification(null);
    
    const data = new FormData();
    data.append('userId', user.id);
    data.append('bio', formData.bio);
    data.append('tradingStyle', formData.tradingStyle);
    data.append('location', formData.location);

    const result = await updateUserProfile(data);

    if (result.success) {
      setNotification({ type: 'success', message: 'Perfil actualizado correctamente.' });
      setTimeout(() => setNotification(null), 3500);
    } else {
      setNotification({ type: 'error', message: 'No se pudieron guardar los cambios. Intenta de nuevo.' });
    }
    
    setSaving(false);
  }

  if (authLoading || (user && loadingData)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#00E599]" size={36} />
      </div>
    );
  }

  if (!user) {
    return <div className="text-white p-6">Por favor inicia sesión para ver tu perfil.</div>;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#121824] via-[#161D2B] to-[#121824] p-6 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
            Identidad Operativa
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Mi Perfil de Trader</h1>
        <p className="text-xs sm:text-sm text-slate-400">Personaliza tu filosofía, estilo de ejecución e información de contacto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Tarjeta de Identidad */}
        <div className="bg-[#121824] border border-white/[0.08] rounded-2xl p-6 h-fit shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#00E599] to-[#00A3FF] p-[2px] mb-4 shadow-[0_0_25px_rgba(0,229,153,0.25)]">
              <div className="w-full h-full rounded-full bg-[#0D1117] overflow-hidden flex items-center justify-center">
                {user.image ? (
                  <img src={user.image} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={38} className="text-slate-300" />
                )}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white tracking-tight">{user.name || 'Trader'}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E599]/15 text-[#00E599] text-xs font-bold border border-[#00E599]/30 mt-1 mb-4">
              <Sparkles size={12} />
              <span>{formData.tradingStyle}</span>
            </div>
            
            <div className="w-full space-y-3 pt-4 border-t border-white/[0.06] text-left">
              <div className="flex items-center gap-3 text-slate-300 text-xs">
                <div className="p-2 bg-[#0D1117] rounded-lg text-slate-400">
                  <Mail size={15} />
                </div>
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-xs">
                <div className="p-2 bg-[#0D1117] rounded-lg text-slate-400">
                  <Calendar size={15} />
                </div>
                <span>Registrado: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Formulario */}
        <div className="lg:col-span-2 bg-[#121824] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl relative">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* NOTIFICACIÓN */}
            {notification && (
              <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${
                notification.type === 'success' 
                  ? 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30' 
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}>
                {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {notification.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Trading Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Estilo de Trading</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <select 
                    value={formData.tradingStyle}
                    onChange={(e) => setFormData({...formData, tradingStyle: e.target.value})}
                    className="w-full bg-[#0D1117] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:border-[#00E599] outline-none appearance-none cursor-pointer"
                  >
                    <option value="Day Trader">Day Trader (Intradía)</option>
                    <option value="Swing Trader">Swing Trader (Multi-días)</option>
                    <option value="Scalper">Scalper (Alta Frecuencia)</option>
                    <option value="Position Trader">Position Trader (Macro)</option>
                    <option value="Investor">Inversionista de Valor</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Ubicación / País</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="ej. Madrid, España / Miami, USA"
                    className="w-full bg-[#0D1117] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:border-[#00E599] outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Filosofía Operativa & Reglas Personales</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Describe tu plan de trading, reglas de gestión de riesgo y objetivos de capital..."
                className="w-full bg-[#0D1117] border border-white/[0.08] text-white rounded-xl p-4 text-xs sm:text-sm focus:border-[#00E599] outline-none placeholder:text-slate-500 resize-none leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#00E599] to-[#00c985] hover:brightness-105 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(0,229,153,0.3)] text-xs sm:text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Guardar Perfil
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}