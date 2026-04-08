import React, { useEffect, useState } from 'react'
import { IndianRupee, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../api'

/**
 * Settings Tab — System Configuration Panel.
 * 
 */
const SettingsTab = () => {
   const [systemSettings, setSystemSettings] = useState({
      penaltyRate: 2.5,
      interestRate: 15.0,
      auctionBuffer: 5,
      autoAlerts: true
   })
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)

   useEffect(() => {
      let isMounted = true

      const loadSettings = async () => {
         try {
            const settings = await adminService.getSystemSettings()
            if (isMounted) {
               setSystemSettings(settings)
            }
         } catch (error) {
            toast.error(error.message || 'Failed to load system settings')
         } finally {
            if (isMounted) {
               setLoading(false)
            }
         }
      }

      loadSettings()

      return () => {
         isMounted = false
      }
   }, [])

   const handleCommit = async () => {
      try {
         setSaving(true)
         await adminService.saveSystemSettings(systemSettings)
         toast.success('System settings saved successfully.')
      } catch (error) {
         toast.error(error.message || 'Failed to save system settings')
      } finally {
         setSaving(false)
      }
  }

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[320px] bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl">
        <p className="text-sm font-bold text-[#2B2620]/60 uppercase tracking-widest">Loading system settings...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl">
       <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand-gold/5 rounded-2xl flex items-center justify-center text-brand-gold"><IndianRupee className="w-6 h-6" /></div>
             <div>
                <h4 className="font-headline font-bold text-[#2B2620] text-xl">Financial Algorithms</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">Configure penalty and interest engines</p>
             </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 ml-2">Default Penalty Rate (%)</label>
               <input type="number" step="0.1" value={systemSettings.penaltyRate} onChange={(e) => setSystemSettings({...systemSettings, penaltyRate: Number(e.target.value)})} className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-[#2B2620] outline-none focus:border-brand-gold/30 shadow-inner" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 ml-2">Annual Interest Ceiling (%)</label>
               <input type="number" step="0.1" value={systemSettings.interestRate} onChange={(e) => setSystemSettings({...systemSettings, interestRate: Number(e.target.value)})} className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-[#2B2620] outline-none focus:border-brand-gold/30 shadow-inner" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 ml-2">Auction Buffer (minutes)</label>
               <input type="number" step="1" min="0" value={systemSettings.auctionBuffer} onChange={(e) => setSystemSettings({...systemSettings, auctionBuffer: Number(e.target.value)})} className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-[#2B2620] outline-none focus:border-brand-gold/30 shadow-inner" />
            </div>
          </div>
       </div>

       <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand-gold/5 rounded-2xl flex items-center justify-center text-brand-gold"><History className="w-6 h-6" /></div>
             <div>
                <h4 className="font-headline font-bold text-[#2B2620] text-xl">Automation Rules</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">Trigger institutional safety protocols</p>
             </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-brand-ivory rounded-3xl border border-brand-gold/5">
                <div>
                   <p className="text-xs font-bold text-[#2B2620] uppercase tracking-widest">Enforce Sequential Locks</p>
                   <p className="text-[10px] text-[#2B2620]/60 font-medium tracking-wide mt-1">Prevent multiple auctions per scheme cycle</p>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${systemSettings.autoAlerts ? 'bg-brand-gold' : 'bg-gray-200'}`} onClick={() => setSystemSettings({...systemSettings, autoAlerts: !systemSettings.autoAlerts})}>
                   <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-sm ${systemSettings.autoAlerts ? 'ml-6' : 'ml-0'}`}></div>
                </div>
            </div>
            <button 
              onClick={handleCommit}
              disabled={saving}
              className="w-full heritage-gradient text-white text-[10px] font-black uppercase tracking-widest py-5 rounded-[2rem] shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
               {saving ? 'Saving Changes...' : 'Commit Operational Changes'}
            </button>
          </div>
       </div>
    </div>
  )
}

export default SettingsTab
