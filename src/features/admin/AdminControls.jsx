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
  Activity
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
    { id: 'roles', label: 'Role Management', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'kyc', label: 'KYC Queue', icon: UserCheck },
    { id: 'overrides', label: 'Safety Overrides', icon: AlertOctagon },
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      let result = []
      if (activeTab === 'roles') result = await adminService.getProfiles()
      else if (activeTab === 'audit') result = await adminService.getAuditLogs()
      else if (activeTab === 'kyc') result = await adminService.getPendingKYC()
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
        header: 'Security Delegate', 
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy">{row.full_name}</span>
            <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">{row.mobile_number}</span>
          </div>
        )
      },
      { 
        header: 'Clearance Level', 
        render: (row) => (
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
            row.role_type === 'admin' ? 'bg-brand-navy text-white' : 'bg-brand-gold/10 text-brand-gold'
          }`}>
            {row.role_type}
          </span>
        )
      },
      { 
        header: 'Action', 
        render: (row) => (
          <button 
            onClick={() => handleToggleRole(row)}
            className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-2"
          >
            {row.role_type === 'admin' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            Modify Role
          </button>
        )
      }
    ],
    audit: [
       { header: 'Event Code', render: (row) => <span className="font-mono text-[10px] text-brand-gold">EVT-{row.id.slice(0,8).toUpperCase()}</span> },
       { header: 'Target Table', render: (row) => <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">{row.table_name}</span> },
       { header: 'Action', render: (row) => <span className="text-sm font-bold text-brand-text/60">{row.action}</span> },
       { header: 'Timestamp', render: (row) => <span className="text-[10px] font-bold text-brand-text/30">{new Date(row.created_at).toLocaleString()}</span> }
    ],
     kyc: [
        { header: 'Applicant', render: (row) => <span className="font-bold text-brand-navy">{row.profiles?.full_name}</span> },
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
              <span className="font-bold text-brand-navy">{row.full_name}</span>
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
               <span className="font-mono text-[10px] text-brand-navy uppercase">REF-{row.id.slice(0,8)}</span>
            </div>
          )
        },
        { header: 'Member', render: (row) => <span className="text-xs font-bold text-brand-navy">{row.profiles?.full_name}</span> },
        { header: 'Amount', render: (row) => <span className="font-headline font-bold text-brand-navy">₹{Number(row.amount).toLocaleString()}</span> },
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
          <div className="flex items-center gap-3 text-brand-navy mb-2">
             <ShieldCheck className="w-6 h-6 border-2 border-brand-navy rounded-lg p-0.5" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Command</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Admin Controls</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Oversee system integrity and enforce security governance.</p>
        </div>
        
        <div className="relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
           <input 
             type="text" 
             placeholder={`Search in ${tabs.find(t => t.id === activeTab).label}...`}
             className="w-80 bg-white border-2 border-brand-gold/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-gold/30 transition-all shadow-sm"
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
                   ? 'bg-brand-navy text-white shadow-lg' 
                   : 'text-brand-navy/40 hover:bg-brand-navy/5'
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
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${overrideFilter === 'members' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-text/30'}`}
             >
               Identity Holds
             </button>
             <button 
               onClick={() => setOverrideFilter('transactions')}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${overrideFilter === 'transactions' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-text/30'}`}
             >
               Financial Reversal
             </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden min-h-[500px]">
         <DataTable columns={columns[activeTab]} data={filteredData} loading={loading} />
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
                  Executing safety reversal for REF-{selectedItem?.id?.slice(0,8)}. 
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
