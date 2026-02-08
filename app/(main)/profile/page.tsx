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
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, status } = useAuth();
  const authLoading = status === "loading";
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para notificaciones (Éxito o Error)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    bio: '',
    tradingStyle: 'Day Trader',
    location: '',
  });

  // Cargar datos
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
    setNotification(null); // Limpiar notificaciones previas
    
    const data = new FormData();
    data.append('userId', user.id);
    data.append('bio', formData.bio);
    data.append('tradingStyle', formData.tradingStyle);
    data.append('location', formData.location);

    const result = await updateUserProfile(data);

    if (result.success) {
      // Mostrar mensaje de éxito
      setNotification({ type: 'success', message: 'Changes saved successfully.' });
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setNotification(null), 3000);
    } else {
      // Mostrar mensaje de error
      setNotification({ type: 'error', message: 'Failed to save changes. Please try again.' });
    }
    
    setSaving(false);
  }

  if (authLoading || (user && loadingData)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#00FF7F]" size={40} />
      </div>
    );
  }

  if (!user) {
    return <div className="text-white">Please log in to view your profile.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm">Manage your trader identity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Tarjeta de Identidad */}
        <div className="bg-[#0B0E11] border border-gray-800 rounded-xl p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00FF7F] to-[#00A3FF] p-[2px] mb-4">
              <div className="w-full h-full rounded-full bg-[#0B0E11] overflow-hidden flex items-center justify-center">
                {user.image ? (
                  <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-[#00FF7F] text-sm font-medium mb-4">{formData.tradingStyle}</p>
            
            <div className="w-full space-y-3 pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={16} />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Formulario */}
        <div className="lg:col-span-2 bg-[#0B0E11] border border-gray-800 rounded-xl p-6 relative">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* NOTIFICACIÓN INTEGRADA */}
            {notification && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
                notification.type === 'success' 
                  ? 'bg-[#00FF7F]/10 text-[#00FF7F] border border-[#00FF7F]/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {notification.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trading Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Trading Style</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                  <select 
                    value={formData.tradingStyle}
                    onChange={(e) => setFormData({...formData, tradingStyle: e.target.value})}
                    className="w-full bg-[#13171D] border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-[#00FF7F] focus:border-[#00FF7F] outline-none appearance-none"
                  >
                    <option value="Day Trader">Day Trader</option>
                    <option value="Swing Trader">Swing Trader</option>
                    <option value="Scalper">Scalper</option>
                    <option value="Position Trader">Position Trader</option>
                    <option value="Investor">Investor</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. New York, USA"
                    className="w-full bg-[#13171D] border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-[#00FF7F] focus:border-[#00FF7F] outline-none placeholder-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Bio / Trading Philosophy</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about your trading journey..."
                className="w-full bg-[#13171D] border border-gray-800 text-white rounded-lg p-4 focus:ring-1 focus:ring-[#00FF7F] focus:border-[#00FF7F] outline-none placeholder-gray-600 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#00FF7F] hover:bg-[#00cc66] text-black font-bold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Changes
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