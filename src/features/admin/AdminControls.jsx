import React, { useState } from 'react'
import { 
  ShieldCheck, 
  Settings,
  History, 
  UserCheck, 
  AlertOctagon, 
  Search
} from 'lucide-react'

// Tab components — each owns its own data state (Fixes Bug #1: stale data on tab switch)
import RolesTab from './tabs/RolesTab'
import KYCTab from './tabs/KYCTab'
import AuditTab from './tabs/AuditTab'
import OverridesTab from './tabs/OverridesTab'
import SettingsTab from './tabs/SettingsTab'

const AdminControls = () => {
  const [activeTab, setActiveTab] = useState('roles')
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'roles', label: 'Security & RBAC', icon: ShieldCheck },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'kyc', label: 'KYC Queue', icon: UserCheck },
    { id: 'overrides', label: 'Safety Overrides', icon: AlertOctagon },
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 text-brand-gold mb-2">
             <ShieldCheck className="w-6 h-6 border-2 border-brand-gold rounded-lg p-0.5" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Command</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Admin Controls</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Oversee system integrity and enforce security governance.</p>
        </div>
        
        {activeTab !== 'settings' && (
          <div className="relative group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder={`Search in ${tabs.find(t => t.id === activeTab).label}...`}
                className="w-80 bg-white border-2 border-brand-gold/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/30 transition-all shadow-sm"
                value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white p-1.5 rounded-[2rem] border border-brand-gold/5 w-fit shadow-sm mb-8">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
             className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === tab.id 
                 ? 'heritage-gradient text-white shadow-lg' 
                 : 'text-[#2B2620]/40 hover:bg-brand-gold/5'
             }`}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Tab Content — each tab mounts/unmounts independently, owning its own state */}
      <div className="min-h-[500px]">
        {activeTab === 'roles'     && <RolesTab searchTerm={searchTerm} />}
        {activeTab === 'kyc'       && <KYCTab searchTerm={searchTerm} />}
        {activeTab === 'audit'     && <AuditTab searchTerm={searchTerm} />}
        {activeTab === 'overrides' && <OverridesTab searchTerm={searchTerm} />}
        {activeTab === 'settings'  && <SettingsTab />}
      </div>
    </div>
  )
}

export default AdminControls
