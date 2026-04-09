import React, { useEffect, useState } from 'react'
import { 
  ShieldCheck, 
  Users, 
  History, 
  UserCheck, 
  AlertOctagon, 
  Search,
  Lock,
  Unlock,
  Check,
  X,
  FileText,
  ArrowUpRight,
  Activity,
  Settings,
  CircleDollarSign,
  Fingerprint,
  IndianRupee
} from 'lucide-react'
import { adminService } from './api'
import { financeService } from '../finance/api'
import DataTable from '../../shared/components/ui/DataTable'
import toast from 'react-hot-toast'
import Modal from '../../shared/components/ui/Modal'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'

const AdminControls = () => {
  const [activeTab, setActiveTab] = useState('roles')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false)
  const [reverseReason, setReverseReason] = useState('')
  const [reverseConfirmText, setReverseConfirmText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [overrideFilter, setOverrideFilter] = useState('members') // 'members' or 'transactions'

  const tabs = [
    { id: 'roles', label: 'Security & RBAC', icon: ShieldCheck },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'kyc', label: 'KYC Queue', icon: UserCheck },
    { id: 'overrides', label: 'Safety Overrides', icon: AlertOctagon },
  ]

  const [systemSettings, setSystemSettings] = useState({
    penaltyRate: 2.5,
    interestRate: 15.0,
    auctionBuffer: 5,
    autoAlerts: true
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      let result = []
      if (activeTab === 'roles') result = await adminService.getProfiles()
      else if (activeTab === 'audit') result = await adminService.getAuditLogs()
      else if (activeTab === 'kyc') result = await adminService.getPendingKYC()
      else if (activeTab === 'settings') {
        // Mocking settings fetch or keeping local
        result = []
      }
      else if (activeTab === 'overrides') {
         if (overrideFilter === 'members') {
           result = await adminService.getProfiles()
         } else {
           const allLedger = await financeService.getLedger()
           result = allLedger.filter(l => l.reference_type === 'contribution')
         }
      }
      setData(result)
    } catch (error) {
      toast.error('Failed to load control panel data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab, overrideFilter])

  const handleToggleRole = async (user) => {
    const newRole = user.role_type === 'admin' ? 'member' : 'admin'
    try {
      toast.loading(`Updating security clearance for ${user.full_name}...`, { id: 'role' })
      await adminService.updateRole(user.id, newRole)
      toast.success('Clearance updated!', { id: 'role' })
      fetchData()
    } catch (error) {
      toast.error('Update failed', { id: 'role' })
    }
  }

  const handleVerifyKYC = async (kyc) => {
    try {
      toast.loading('Verifying identity documents...', { id: 'kyc' })
      await adminService.verifyKYC(kyc.id, kyc.user_id)
      toast.success('Identity verified!', { id: 'kyc' })
      fetchData()
    } catch (error) {
      toast.error('Identity verification failed', { id: 'kyc' })
    }
  }

  const handleToggleFreeze = async (user) => {
    try {
      setIsProcessing(true)
      const newStatus = !user.is_frozen
      toast.loading(`${newStatus ? 'Freezing' : 'Unfreezing'} account...`, { id: 'freeze' })
      await adminService.freezeMember(user.id, newStatus)
      toast.success(`Account ${newStatus ? 'Frozen' : 'Unfrozen'} Successfully`, { id: 'freeze' })
      setSelectedItem(null)
      setIsConfirmOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Override failed', { id: 'freeze' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReversePayment = async (ledgerId, reason) => {
    try {
      setIsProcessing(true)
      toast.loading('Committing institutional reversal...', { id: 'reverse' })
      await adminService.reversePayment(ledgerId, reason)
      toast.success('Financial Reversal Complete', { id: 'reverse' })
      setIsReverseModalOpen(false)
      setSelectedItem(null)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Reversal protocol failed', { id: 'reverse' })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const searchStr = (item.full_name || item.profiles?.full_name || item.action || '').toLowerCase()
    return searchStr.includes(searchTerm.toLowerCase())
  }) : []

  const columns = {
    roles: [
      { 
        header: 'Admin Profile', 
        render: (row) => (
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center text-brand-gold border border-brand-gold/10">
                <Fingerprint className="w-5 h-5" />
             </div>
             <div className="flex flex-col text-left">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-[#2B2620]">{row.full_name || 'Anonymous User'}</span>
                 <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${row.role_type === 'admin' ? 'bg-[#2B2620] text-white' : 'bg-brand-gold/10 text-brand-gold'}`}>
                   {row.role_type === 'admin' ? 'ADMIN' : 'MEMBER'}
                 </span>
               </div>
               <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest leading-none mt-1">{row.mobile_number}</span>
             </div>
          </div>
        )
      },
      { 
        header: 'Access Rights', 
        render: (row) => (
          <div className="flex flex-col gap-2">
             <div className="flex gap-1.5">
                {['Auctions', 'Payments', 'Ledger'].map(mod => (
                  <div 
                    key={mod} 
                    className={`w-2.5 h-2.5 rounded-full ${row.role_type === 'admin' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-brand-gold/20'}`} 
                    title={`${mod} Access: ${row.role_type === 'admin' ? 'Granted' : 'Restricted'}`}
                  ></div>
                ))}
             </div>
             <span className="text-[8px] font-black uppercase tracking-tighter text-brand-text/40">
               {row.role_type === 'admin' ? 'Full Authority' : 'Restricted Access'}
             </span>
          </div>
        )
      },
      { 
        header: 'Action', 
        render: (row) => (
          <button 
            onClick={() => handleToggleRole(row)}
            className="bg-brand-ivory text-[#2B2620] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-brand-gold hover:text-white transition-all shadow-sm flex items-center gap-2"
          >
            {row.role_type === 'admin' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            Modify Role
          </button>
        )
      }
    ],
    audit: [
       { header: 'Event Code', render: (row) => <span className="font-mono text-[10px] text-brand-gold">EVT-{row.id.slice(0,8).toUpperCase()}</span> },
       { header: 'Target Table', render: (row) => <span className="text-xs font-bold text-[#2B2620] uppercase tracking-widest">{row.table_name}</span> },
       { header: 'Action', render: (row) => <span className="text-sm font-bold text-brand-text/60">{row.action}</span> },
       { header: 'Timestamp', render: (row) => <span className="text-[10px] font-bold text-brand-text/30">{new Date(row.created_at).toLocaleString()}</span> }
    ],
     kyc: [
        { header: 'Applicant', render: (row) => <span className="font-bold text-[#2B2620]">{row.profiles?.full_name}</span> },
        { header: 'Identification', render: (row) => <span className="font-mono text-[10px] text-brand-gold">ID: XXXX-XXXX-{row.aadhaar_number?.slice(-4)}</span> },
        { 
          header: 'Compliance Action', 
          render: (row) => (
            <div className="flex items-center gap-4">
               <button onClick={() => handleVerifyKYC(row)} className="text-green-600 hover:text-green-700 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Approve</button>
               <button disabled className="text-red-600/40 font-bold flex items-center gap-1 cursor-not-allowed"><X className="w-4 h-4" /> Reject</button>
            </div>
          )
        }
     ],
     overrides: overrideFilter === 'members' ? [
        { 
           header: 'Entity Identity', 
           render: (row) => (
             <div className="flex flex-col">
               <span className="font-bold text-[#2B2620]">{row.full_name}</span>
               <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">{row.mobile_number}</span>
             </div>
          )
        },
        { 
          header: 'Status', 
          render: (row) => (
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              row.is_frozen ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {row.is_frozen ? 'Frozen' : 'Active'}
            </span>
          )
        },
        { 
          header: 'Action', 
          render: (row) => (
            <button 
              onClick={() => {
                setSelectedItem(row)
                setIsConfirmOpen(true)
              }}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm ${
                row.is_frozen 
                  ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' 
                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
              }`}
            >
              {row.is_frozen ? 'Force Unfreeze' : 'Emergency Freeze'}
            </button>
          )
        }
     ] : [
        { 
          header: 'Transaction Ref', 
           render: (row) => (
             <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-brand-gold" />
                <span className="font-mono text-[10px] text-[#2B2620] uppercase">REF-{row.id.slice(0,8)}</span>
             </div>
          )
        },
         { header: 'Member', render: (row) => <span className="text-xs font-bold text-[#2B2620]">{row.profiles?.full_name}</span> },
         { header: 'Amount', render: (row) => <span className="font-headline font-bold text-[#2B2620]">₹{Number(row.amount).toLocaleString()}</span> },
        { 
          header: 'Action', 
          render: (row) => (
            <button 
              onClick={() => {
                setSelectedItem(row)
                setIsReverseModalOpen(true)
                setReverseReason('')
                setReverseConfirmText('')
              }}
              className="bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
            >
              Request Reversal
            </button>
          )
        }
     ]
  }

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
      </header>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex gap-2 bg-white p-1.5 rounded-[2rem] border border-brand-gold/5 w-fit shadow-sm">
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

        {activeTab === 'overrides' && (
          <div className="flex gap-1 bg-brand-ivory p-1 rounded-2xl border border-brand-gold/5 w-fit h-fit self-center">
             <button 
               onClick={() => setOverrideFilter('members')}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${overrideFilter === 'members' ? 'bg-white text-[#2B2620] shadow-sm' : 'text-brand-text/30'}`}
             >
               Identity Holds
             </button>
             <button 
               onClick={() => setOverrideFilter('transactions')}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${overrideFilter === 'transactions' ? 'bg-white text-[#2B2620] shadow-sm' : 'text-brand-text/30'}`}
             >
               Financial Reversal
             </button>
          </div>
        )}
      </div>

      <div className="min-h-[500px]">
         {activeTab === 'settings' ? (
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
                       <input type="number" step="0.1" value={systemSettings.penaltyRate} onChange={(e) => setSystemSettings({...systemSettings, penaltyRate: e.target.value})} className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-[#2B2620] outline-none focus:border-brand-gold/30 shadow-inner" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 ml-2">Annual Interest Ceiling (%)</label>
                       <input type="number" step="0.1" value={systemSettings.interestRate} onChange={(e) => setSystemSettings({...systemSettings, interestRate: e.target.value})} className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-[#2B2620] outline-none focus:border-brand-gold/30 shadow-inner" />
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
                  <div className="space-y-6">                     <div className="flex items-center justify-between p-6 bg-brand-ivory rounded-3xl border border-brand-gold/5">
                        <div>
                           <p className="text-xs font-bold text-[#2B2620] uppercase tracking-widest">Enforce Sequential Locks</p>
                           <p className="text-[10px] text-[#2B2620]/60 font-medium tracking-wide mt-1">Prevent multiple auctions per scheme cycle</p>
                        </div>
                        <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${systemSettings.autoAlerts ? 'bg-brand-gold' : 'bg-gray-200'}`} onClick={() => setSystemSettings({...systemSettings, autoAlerts: !systemSettings.autoAlerts})}>
                           <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-sm ${systemSettings.autoAlerts ? 'ml-6' : 'ml-0'}`}></div>
                        </div>
                    </div>
                    <button className="w-full heritage-gradient text-white text-[10px] font-black uppercase tracking-widest py-5 rounded-[2rem] shadow-xl hover:brightness-110 active:scale-95 transition-all">
                       Commit Operational Changes
                    </button>

                 </div>
              </div>
           </div>
         ) : (
           <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden min-h-[500px]">
             <DataTable columns={columns[activeTab]} data={filteredData} loading={loading} />
           </div>
         )}
      </div>

      <ConfirmDialog 
        isOpen={activeTab === 'overrides' && overrideFilter === 'members' && isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => handleToggleFreeze(selectedItem)}
        title={selectedItem?.is_frozen ? "Unfreeze Account" : "Emergency Freeze"}
        message={selectedItem?.is_frozen 
          ? `Restore financial access for ${selectedItem?.full_name}?` 
          : `CAUTION: Freezing ${selectedItem?.full_name} will immediately block all their bidding and payment activities. Continue?`}
        intent={selectedItem?.is_frozen ? "brand" : "danger"}
        loading={isProcessing}
      />

      <Modal 
        isOpen={activeTab === 'overrides' && overrideFilter === 'transactions' && isReverseModalOpen} 
        onClose={() => setIsReverseModalOpen(false)} 
        title="Institutional Reversal Override"
      >
        <div className="space-y-6">
           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
              <Activity className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs text-amber-900 leading-relaxed font-bold">Override Protocol</p>
                <p className="text-[10px] text-amber-800 leading-relaxed mt-1"> 
                  Executing safety reversal for REF-{String(selectedItem?.id || '').slice(0,8)}. 
                  This will credited the amount back to the member's outstanding balance.
                </p>
              </div>
           </div>

           <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mb-2 block px-2">Audit Reason</label>
                <textarea 
                  className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/30 h-24"
                  placeholder="Justify this financial mutation..."
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mb-2 block px-2">Verification Sequence</label>
                <p className="text-[9px] mb-2 px-2 opacity-50 italic font-medium">Type "REVERSE" to authorize.</p>
                <input 
                  type="text" 
                  className="w-full bg-brand-ivory border border-brand-gold/5 rounded-2xl px-4 py-3 text-sm font-bold uppercase focus:outline-none focus:border-brand-gold/30"
                  placeholder="Command Match"
                  value={reverseConfirmText}
                  onChange={(e) => setReverseConfirmText(e.target.value)}
                />
              </div>
           </div>

           <button 
             onClick={() => handleReversePayment(selectedItem.id, reverseReason)}
             disabled={reverseConfirmText !== 'REVERSE' || isProcessing}
             className={`w-full font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
               reverseConfirmText === 'REVERSE' 
                 ? 'bg-red-600 text-white shadow-red-600/20' 
                 : 'bg-gray-100 text-gray-400 cursor-not-allowed'
             }`}
           >
             Commit Override <ShieldCheck className="w-5 h-5" />
           </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminControls
