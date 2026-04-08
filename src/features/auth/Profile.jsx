import React, { useState } from 'react'
import { User, Shield, Key, LogOut, Mail, Phone, Calendar, Landmark, Settings, Bell, Fingerprint, Edit2, Save, X, Check } from 'lucide-react'
import { useAuth } from '../../core/providers/AuthProvider'
import { updateProfile, changePin } from './authService'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout: signOut, refreshProfile } = useAuth()
  const profile = user // Map for compatibility
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || ''
  })
  const [saving, setSaving] = useState(false)
  
  // PIN change state
  const [showPinChange, setShowPinChange] = useState(false)
  const [pinForm, setPinForm] = useState({ current: '', new: '', confirm: '' })
  const [changingPin, setChangingPin] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Session terminated. Secure exit complete.')
    } catch (error) {
      toast.error('Sign out failed')
    }
  }

  const startEditing = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      pincode: profile?.pincode || ''
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      pincode: profile?.pincode || ''
    })
  }

  const handleSaveProfile = async () => {
    if (!profile?.id) {
      toast.error('No profile to update')
      return
    }

    setSaving(true)
    try {
      await updateProfile(profile.id, editForm)
      toast.success('Profile updated successfully')
      setIsEditing(false)
      if (refreshProfile) refreshProfile()
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePin = async () => {
    if (pinForm.new !== pinForm.confirm) {
      toast.error('New PINs do not match')
      return
    }
    if (pinForm.new.length < 4) {
      toast.error('PIN must be at least 4 digits')
      return
    }

    setChangingPin(true)
    try {
      await changePin(profile.id, pinForm.current, pinForm.new)
      toast.success('PIN changed successfully')
      setShowPinChange(false)
      setPinForm({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to change PIN')
    } finally {
      setChangingPin(false)
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
           {/* Editable Profile Section */}
           <div className="bg-white p-12 rounded-[3.5rem] border border-brand-gold/10 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 flex items-center justify-center"><User className="w-6 h-6 text-brand-gold" /></div>
                   <h3 className="text-2xl font-headline font-bold text-[#2B2620]">Profile Information</h3>
                </div>
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold hover:bg-brand-gold hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/20 text-brand-text/60 text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Changes</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-brand-ivory rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#2B2620]">{profile?.full_name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-brand-ivory rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#2B2620]">{profile?.email || 'Not set'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-brand-ivory rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#2B2620]">{profile?.address || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-brand-ivory rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#2B2620]">{profile?.city || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-brand-ivory rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#2B2620]">{profile?.state || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-brand-ivory rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#2B2620]">{profile?.pincode || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Phone Number</label>
                  <p className="text-sm font-bold text-[#2B2620]/50 italic">{profile?.mobile_number || profile?.phone_number || 'Not set'} (Read-only)</p>
                </div>
              </div>
           </div>

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
                    {!showPinChange ? (
                      <button 
                        onClick={() => setShowPinChange(true)}
                        className="w-full flex items-center justify-between p-6 bg-brand-ivory rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all group"
                      >
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm"><Fingerprint className="w-6 h-6 text-brand-gold/40" /></div>
                           <div className="text-left">
                              <p className="text-sm font-bold text-[#2B2620]">Change PIN</p>
                              <p className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest mt-1">Update your secure access PIN</p>
                           </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-brand-gold/40 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="p-6 bg-brand-ivory rounded-3xl border border-brand-gold/10 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Fingerprint className="w-5 h-5 text-brand-gold" />
                            <span className="font-bold text-[#2B2620]">Change PIN</span>
                          </div>
                          <button onClick={() => setShowPinChange(false)} className="text-brand-text/30 hover:text-brand-text">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Current PIN</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                            value={pinForm.current}
                            onChange={(e) => setPinForm({ ...pinForm, current: e.target.value })}
                            maxLength={6}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">New PIN</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                            value={pinForm.new}
                            onChange={(e) => setPinForm({ ...pinForm, new: e.target.value })}
                            maxLength={6}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Confirm New PIN</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                            value={pinForm.confirm}
                            onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value })}
                            maxLength={6}
                          />
                        </div>
                        <button
                          onClick={handleChangePin}
                          disabled={changingPin || !pinForm.current || !pinForm.new || !pinForm.confirm}
                          className="w-full py-3 rounded-xl bg-brand-gold text-white text-xs font-black uppercase tracking-widest hover:bg-brand-goldDark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {changingPin ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <><Check className="w-4 h-4" /> Update PIN</>
                          )}
                        </button>
                      </div>
                    )}
                    
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
