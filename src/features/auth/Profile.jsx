import React from 'react'
import { User, Shield, Key, LogOut, Mail, Phone, Calendar, Landmark, Settings, Bell, Fingerprint } from 'lucide-react'
import { useAuth } from '../../core/providers/AuthProvider'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout: signOut } = useAuth()
  const profile = user // Map for compatibility

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Session terminated. Secure exit complete.')
    } catch (error) {
      toast.error('Sign out failed')
    }
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Administrator Profile</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Manage your institutional identity and security credentials.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-brand-gold/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-full h-24 heritage-gradient"></div>
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl z-10 relative mt-4">
                 <div className="w-full h-full rounded-[2rem] bg-brand-ivory flex items-center justify-center border-2 border-brand-gold/20">
                    <User className="w-12 h-12 text-brand-gold" />
                 </div>
              </div>
              
              <div className="mt-6 z-10">
                <h4 className="text-2xl font-headline font-bold text-[#2B2620]">{profile?.full_name || 'Super Admin'}</h4>
                <div className="mt-2 flex items-center justify-center gap-2">
                   <Shield className="w-3.5 h-3.5 text-brand-gold" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80">{profile?.role_type || 'Administrator'}</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-brand-gold/10 my-8"></div>

              <div className="w-full space-y-4 text-left">
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-brand-ivory flex items-center justify-center text-brand-gold/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all">
                       <Mail className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-brand-text/30 leading-none mb-1">Institutional Email</p>
                       <p className="text-xs font-bold text-[#2B2620]">{user?.email || 'admin@sreemnidhi.com'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-brand-ivory flex items-center justify-center text-brand-gold/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all">
                       <Phone className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-brand-text/30 leading-none mb-1">Contact Anchor</p>
                       <p className="text-xs font-bold text-[#2B2620]">{profile?.phone_number || '+91 98765 43210'}</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-10 py-4 rounded-full border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all flex items-center justify-center gap-3"
              >
                <LogOut className="w-4 h-4" /> Terminate Session
              </button>
           </div>
           
           <div className="bg-[#2B2620] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Landmark className="w-24 h-24 text-white" />
              </div>
              <h5 className="text-brand-gold font-headline font-bold text-lg mb-4">Security Baseline</h5>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-white/40 text-[9px] font-black uppercase tracking-widest">
                    <span>2FA Status</span>
                    <span className="text-green-500">Active</span>
                 </div>
                 <div className="flex justify-between items-center text-white/40 text-[9px] font-black uppercase tracking-widest">
                    <span>Last Login</span>
                    <span className="text-white/60">Mar 27, 08:30 AM</span>
                 </div>
                 <div className="flex justify-between items-center text-white/40 text-[9px] font-black uppercase tracking-widest">
                    <span>IP Anchor</span>
                    <span className="text-white/60">152.1.XX.XX</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Settings Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-12 rounded-[3.5rem] border border-brand-gold/10 shadow-sm space-y-12">
              <section>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 flex items-center justify-center"><Settings className="w-6 h-6 text-brand-gold" /></div>
                    <h3 className="text-2xl font-headline font-bold text-[#2B2620]">General Preferences</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-brand-ivory/50 p-6 rounded-3xl border border-brand-gold/5 group hover:bg-white transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-4">
                          <Bell className="w-6 h-6 text-brand-gold/40 group-hover:text-brand-gold" />
                          <div className="w-10 h-6 bg-brand-gold/20 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                       </div>
                       <p className="text-sm font-bold text-[#2B2620] leading-none mb-2">Push Alerts</p>
                       <p className="text-[10px] text-brand-text/30 font-medium leading-relaxed">Receive real-time notifications for ledger entries.</p>
                    </div>
                    <div className="bg-brand-ivory/50 p-6 rounded-3xl border border-brand-gold/5 group hover:bg-white transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-4">
                          <Shield className="w-6 h-6 text-brand-gold/40 group-hover:text-brand-gold" />
                          <div className="w-10 h-6 bg-brand-gold/20 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                       </div>
                       <p className="text-sm font-bold text-[#2B2620] leading-none mb-2">Audit Logs</p>
                       <p className="text-[10px] text-brand-text/30 font-medium leading-relaxed">Keep detailed history of your administrative actions.</p>
                    </div>
                 </div>
              </section>

              <div className="h-[1px] bg-brand-gold/5"></div>

              <section>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 flex items-center justify-center"><Key className="w-6 h-6 text-brand-gold" /></div>
                    <h3 className="text-2xl font-headline font-bold text-[#2B2620]">Access Control</h3>
                 </div>
                 
                 <div className="space-y-6">
                    <button className="w-full flex items-center justify-between p-6 bg-brand-ivory rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm"><Fingerprint className="w-6 h-6 text-brand-gold/40" /></div>
                          <div className="text-left">
                             <p className="text-sm font-bold text-[#2B2620]">Update Cryptographic Password</p>
                             <p className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest mt-1">Last rotated 45 days ago</p>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-brand-gold/40 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-6 bg-brand-ivory rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm"><Shield className="w-6 h-6 text-brand-gold/40" /></div>
                          <div className="text-left">
                             <p className="text-sm font-bold text-[#2B2620]">Manage Institutional Keys</p>
                             <p className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest mt-1">Configure Supabase Service Roles</p>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-brand-gold/40 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  )
}

const ChevronRight = ({ className }) => <span className={`material-symbols-outlined ${className}`}>chevron_right</span>

export default Profile
