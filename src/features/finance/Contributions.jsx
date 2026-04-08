import React, { useEffect, useState } from 'react'
import { IndianRupee, Search, Filter, Calendar, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react'
import { financeService } from './api'
import { chitService } from '../chits/api'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import toast from 'react-hot-toast'

const PAGE_SIZE = 25

const Contributions = () => {
  const [contributions, setContributions] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [chits, setChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ chitId: '', month: '' })
  const [page, setPage] = useState(0)
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, row: null, reason: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contResult, chitData] = await Promise.all([
        financeService.getContributions(filters.chitId, filters.month, { page, pageSize: PAGE_SIZE }),
        chitService.getChits()
      ])
      setContributions(contResult.data)
      setTotalCount(contResult.total)
      setChits(chitData)
    } catch (error) {
      toast.error('Failed to load contributions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [filters])

  const handleMarkPaid = async (row) => {
    setConfirmModal({ open: true, type: 'paid', row, reason: '' })
  }

  const handleMarkFailed = (row) => {
    setConfirmModal({ open: true, type: 'failed', row, reason: '' })
  }

  const handleMarkWaived = (row) => {
    setConfirmModal({ open: true, type: 'waived', row, reason: '' })
  }

  const executeAction = async () => {
    const { type, row, reason } = confirmModal
    try {
      toast.loading(`Processing ${type} action...`, { id: 'cont-action' })
      
      if (type === 'paid') {
        await financeService.recordContribution(row.member_id, row.month_number, row.amount)
        toast.success('Payment verified successfully!', { id: 'cont-action' })
      } else if (type === 'failed') {
        await financeService.markContributionFailed(row.id, reason)
        toast.success('Contribution marked as failed', { id: 'cont-action' })
      } else if (type === 'waived') {
        await financeService.markContributionWaived(row.id, reason)
        toast.success('Contribution waived', { id: 'cont-action' })
      }
      
      setConfirmModal({ open: false, type: null, row: null, reason: '' })
      fetchData()
    } catch (error) {
      toast.error(error.message || `Failed to ${type} contribution`, { id: 'cont-action' })
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const columns = [
    { 
      header: 'Beneficiary Delegate', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center font-bold text-sm text-brand-gold border border-brand-gold/10 group-hover:bg-white transition-all shadow-sm">
            {row.chit_members?.profiles?.full_name?.[0] || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-[#2B2620] leading-none mb-1">{row.chit_members?.profiles?.full_name}</span>
            <span className="text-[10px] text-brand-text/30 font-bold tracking-widest uppercase">ID: {row.member_id.slice(0, 6).toUpperCase()}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Cycle Reference', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-gold opacity-40" />
          <span className="font-mono text-xs font-bold text-brand-gold tracking-tighter">Month {row.month_number}</span>
        </div>
      )
    },
    { 
      header: 'Installment', 
      render: (row) => <span className="font-bold text-[#2B2620]">₹{Number(row.amount).toLocaleString()}</span> 
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      render: (row) => {
        if (row.status === 'paid') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Cleared</span>
        }
        if (row.status === 'failed') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">Failed</span>
        }
        if (row.status === 'waived') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Waived</span>
        }
        return (
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); handleMarkPaid(row); }}
              className="bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-brand-goldDark transition-all shadow-md active:scale-95"
            >
              Verify
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleMarkFailed(row); }}
              className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-red-600 transition-all shadow-md active:scale-95"
            >
              Failed
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleMarkWaived(row); }}
              className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-amber-600 transition-all shadow-md active:scale-95"
            >
              Waive
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Contribution Registry</h2>
        <p className="text-on-surface-variant font-body mt-2 opacity-70">Orchestrate premium installments and verify trust compliance.</p>
      </header>

      {/* Filter Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 p-6 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-brand-gold/5 shadow-sm items-center">
        <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
             <select 
               className="w-full bg-white border-2 border-brand-gold/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/30 transition-all appearance-none cursor-pointer shadow-sm"
               value={filters.chitId}
               onChange={(e) => setFilters({...filters, chitId: e.target.value})}
             >
               <option value="">Filter by Collective Scheme...</option>
               {chits.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>
           
           <div className="relative group">
             <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
             <input 
               type="number" 
               placeholder="Month #"
               className="w-full md:w-40 bg-white border-2 border-brand-gold/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/30 transition-all shadow-sm"
               value={filters.month}
               onChange={(e) => setFilters({...filters, month: e.target.value})}
             />
           </div>
        </div>
        
        <div className="h-10 w-[2px] bg-brand-gold/10 hidden lg:block"></div>

        <div className="flex items-center gap-10 px-6">
           <div className="flex flex-col items-center">
             <span className="text-xl font-headline font-bold text-[#2B2620]">{totalCount}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold opacity-50 mt-1">Total</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-xl font-headline font-bold text-green-600">{contributions.filter(c => c.status === 'paid').length}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold opacity-50 mt-1">Paid</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-xl font-headline font-bold text-red-500">{contributions.filter(c => c.status === 'pending').length}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold opacity-50 mt-1">Pending</span>
           </div>
        </div>
      </div>

      <DataTable columns={columns} data={contributions} loading={loading} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-gold/10 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-gold/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm font-bold text-brand-text/60">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-gold/10 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-gold/5 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                confirmModal.type === 'paid' ? 'bg-green-100' : 
                confirmModal.type === 'failed' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  confirmModal.type === 'paid' ? 'text-green-600' : 
                  confirmModal.type === 'failed' ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-[#2B2620]">
                  {confirmModal.type === 'paid' ? 'Verify Payment' : 
                   confirmModal.type === 'failed' ? 'Mark as Failed' : 'Waive Contribution'}
                </h3>
                <p className="text-sm text-brand-text/50">
                  {confirmModal.row?.chit_members?.profiles?.full_name} - Month {confirmModal.row?.month_number}
                </p>
              </div>
            </div>

            <p className="text-sm text-brand-text/70 mb-4">
              {confirmModal.type === 'paid' 
                ? 'This will record the payment and update the ledger. This action affects financial records.'
                : confirmModal.type === 'failed'
                ? 'This will mark the contribution as failed. Please provide a reason.'
                : 'This will waive the contribution requirement. Please provide a reason.'}
            </p>

            {(confirmModal.type === 'failed' || confirmModal.type === 'waived') && (
              <textarea
                placeholder="Reason for this action..."
                className="w-full p-4 border border-brand-gold/20 rounded-2xl text-sm mb-4 focus:outline-none focus:border-brand-gold/50"
                rows={3}
                value={confirmModal.reason}
                onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, type: null, row: null, reason: '' })}
                className="flex-1 px-6 py-3 rounded-full border border-brand-gold/20 text-sm font-bold hover:bg-brand-gold/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={(confirmModal.type !== 'paid' && !confirmModal.reason.trim())}
                className={`flex-1 px-6 py-3 rounded-full text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmModal.type === 'paid' ? 'bg-green-600 hover:bg-green-700' :
                  confirmModal.type === 'failed' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contributions
