import React, { useEffect, useState } from 'react'
import { Activity, ShieldCheck } from 'lucide-react'
import { adminService } from '../api'
import { writeAuditLog } from '../../../shared/utils/writeAuditLog'
import DataTable from '../../../shared/components/ui/DataTable'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import Modal from '../../../shared/components/ui/Modal'
import toast from 'react-hot-toast'

const OverridesTab = ({ searchTerm = '' }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [overrideFilter, setOverrideFilter] = useState('members')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false)
  const [reverseReason, setReverseReason] = useState('')
  const [reverseConfirmText, setReverseConfirmText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      let result = []
      if (overrideFilter === 'members') {
        /**
         * FIX: Bug #3 — Use getMembers() which filters role_type='member'
         * instead of getProfiles() which returned admins too.
         */
        result = await adminService.getMembers()
      } else {
        /**
         * FIX: Bug #4 — Use getContributionLedger() which filters server-side
         * instead of fetching the entire ledger and filtering client-side.
         */
        result = await adminService.getContributionLedger()
      }
      setData(result)
    } catch (error) {
      toast.error('Failed to load override data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [overrideFilter])

  const handleToggleFreeze = async (user) => {
    try {
      setIsProcessing(true)
      if (!user?.id) return
      const newStatus = !user.is_frozen
      toast.loading(`${newStatus ? 'Freezing' : 'Unfreezing'} account...`, { id: 'freeze' })
      await adminService.freezeMember(user.id, newStatus)
      toast.success(`Account ${newStatus ? 'Frozen' : 'Unfrozen'} Successfully`, { id: 'freeze' })

      // Audit log: freeze/unfreeze is a critical mutation
      await writeAuditLog({
        action: newStatus ? 'FREEZE' : 'UNFREEZE',
        tableName: 'profiles',
        recordId: user.id
      })

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
      if (!ledgerId) return
      toast.loading('Committing institutional reversal...', { id: 'reverse' })
      await adminService.reversePayment(ledgerId, reason)
      toast.success('Financial Reversal Complete', { id: 'reverse' })

      // Audit log: payment reversal is a critical financial mutation
      await writeAuditLog({
        action: 'REVERSE_PAYMENT',
        tableName: 'ledger',
        recordId: ledgerId
      })

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
    const searchStr = (item.full_name || item.profiles?.full_name || '').toLowerCase()
    return searchStr.includes(searchTerm.toLowerCase())
  }) : []

  const memberColumns = [
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
  ]

  const transactionColumns = [
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

  return (
    <>
      {/* Sub-filter toggle */}
      <div className="flex gap-1 bg-brand-ivory p-1 rounded-2xl border border-brand-gold/5 w-fit mb-6">
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

      <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden min-h-[500px]">
        <DataTable 
          columns={overrideFilter === 'members' ? memberColumns : transactionColumns} 
          data={filteredData} 
          loading={loading} 
        />
      </div>

      {/* Freeze/Unfreeze Confirm Dialog */}
      <ConfirmDialog 
        isOpen={overrideFilter === 'members' && isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => handleToggleFreeze(selectedItem)}
        title={selectedItem?.is_frozen ? "Unfreeze Account" : "Emergency Freeze"}
        message={selectedItem?.is_frozen 
          ? `Restore financial access for ${selectedItem?.full_name}?` 
          : `CAUTION: Freezing ${selectedItem?.full_name} will immediately block all their bidding and payment activities. Continue?`}
        intent={selectedItem?.is_frozen ? "brand" : "danger"}
        loading={isProcessing}
      />

      {/* Payment Reversal Modal */}
      <Modal 
        isOpen={overrideFilter === 'transactions' && isReverseModalOpen} 
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
                  This will credit the amount back to the member's outstanding balance.
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
             disabled={reverseConfirmText !== 'REVERSE' || isProcessing}
             onClick={() => handleReversePayment(selectedItem.id, reverseReason)}
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
    </>
  )
}

export default OverridesTab
