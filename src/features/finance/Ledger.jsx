import React, { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  X,
  CreditCard,
  Wallet,
  Activity,
  Trash2,
  Pencil,
  Eye,
  ShieldCheck
} from 'lucide-react'
import { useLedger } from './useLedger'
import { useMembers } from '../members/useMembers'
import { adminService } from '../admin/api' // Added for reverse override
import { useDebounce } from '../../shared/hooks/useDebounce'
import { useAuth } from '../../core/providers/AuthProvider'
import DataTable from '../../shared/components/ui/DataTable'
import LedgerFormModal from './components/LedgerFormModal'
import LedgerDetailModal from './components/LedgerDetailModal'
import DateRangePicker from '../../shared/components/ui/DateRangePicker'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'
import Modal from '../../shared/components/ui/Modal'
import { exportToCSV, exportToPDF } from '../../shared/utils/exportUtils'
import toast from 'react-hot-toast'
import { startOfDay } from 'date-fns'

const Ledger = () => {
  const { isAdmin } = useAuth()
  const { ledger, loading, stats, addEntry, editEntry, removeEntry } = useLedger()
  const { members } = useMembers()

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [memberDrilldown, setMemberDrilldown] = useState(null) // { userId, fullName }

  // Overrides
  const [reverseTarget, setReverseTarget] = useState(null)
  const [reverseReason, setReverseReason] = useState('')
  const [reverseConfirmText, setReverseConfirmText] = useState('')
  const [isReversing, setIsReversing] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Keyboard Shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowAddModal(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Filter Pipeline
  const filteredLedger = useMemo(() => {
    return ledger.filter(l => {
      // Search filter (Member name or ID)
      const name = l.profiles?.full_name?.toLowerCase() || ''
      const phone = l.profiles?.phone_number || ''
      const id = l.id.toLowerCase()
      const search = debouncedSearch.toLowerCase()
      if (search && !name.includes(search) && !id.includes(search) && !phone.includes(search)) return false

      // Type filter
      if (typeFilter !== 'all' && l.transaction_type !== typeFilter) return false

      // Date range filter
      // Date range filter
      if (dateFrom && new Date(l.created_at) < dateFrom) return false
      if (dateTo && new Date(l.created_at) > new Date(new Date(dateTo).setHours(23, 59, 59, 999))) return false

      return true
    })
  }, [ledger, debouncedSearch, typeFilter, dateFrom, dateTo])

  // Responsive stats based on filters
  const displayStats = useMemo(() => {
    const credits = filteredLedger.filter(l => l.transaction_type === 'credit').reduce((s, l) => s + Number(l.amount), 0)
    const debits = filteredLedger.filter(l => l.transaction_type === 'debit').reduce((s, l) => s + Number(l.amount), 0)
    return {
      credits,
      debits,
      balance: credits - debits
    }
  }, [filteredLedger])

  const columns = [
    {
      header: 'Entry Reference',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${row.transaction_type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {row.transaction_type === 'credit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-bold text-brand-text/30 uppercase tracking-tighter">REF-{row.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2B2620] truncate max-w-[100px]">{row.reference_type?.replace('_', ' ') || 'General'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Account Identity',
      render: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            setMemberDrilldown({ userId: row.user_id, fullName: row.profiles?.full_name })
          }}
          className="flex flex-col text-left group"
        >
          <span className="text-xs font-bold text-[#2B2620] group-hover:text-brand-gold transition-colors">{row.profiles?.full_name || 'System Protocol'}</span>
          <span className="text-[9px] text-brand-text/30 font-bold tracking-widest uppercase">{row.chits?.name || 'Treasury'}</span>
        </button>
      )
    },
    {
      header: 'Capital Impact',
      render: (row) => (
        <div className="flex flex-col">
          <span className={`font-headline font-bold ${row.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
            {row.transaction_type === 'credit' ? '+' : '-'} ₹{Number(row.amount).toLocaleString()}
          </span>
          <span className="text-[9px] text-brand-text/20 font-bold">Running: ₹{stats.runningBalances[row.id]?.toLocaleString() || '--'}</span>
        </div>
      )
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-brand-text/60">{new Date(row.created_at).toLocaleDateString()}</span>
          <span className="text-[9px] text-brand-text/30 uppercase font-black tracking-tighter">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedEntry(row); }}
            className="p-1.5 hover:bg-brand-gold/10 text-brand-gold transition-colors rounded-lg"
            title="Audit Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingEntry(row); }}
                className="p-1.5 hover:bg-brand-gold/10 text-brand-gold transition-colors rounded-lg"
                title="Adjust Entry"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {row.reference_type === 'contribution' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReverseTarget(row);
                    setReverseReason('');
                    setReverseConfirmText('');
                  }}
                  className="p-1.5 hover:bg-amber-50 text-amber-600 transition-colors rounded-lg"
                  title="Reverse Payment"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTargetId(row.id);
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 hover:bg-red-50 text-red-500 transition-colors rounded-lg"
                title="Delete Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const handleCreateEntry = async ({ payload, metadata }) => {
    try {
      const member = members.find(m => m.user_id === payload.user_id);
      await addEntry({ 
        payload: { ...payload, full_name: member?.profiles?.full_name }, 
        metadata 
      });
      setShowAddModal(false);
    } catch (err) { }
  }

  const handleUpdateEntry = async ({ payload }) => {
    try {
      await editEntry(editingEntry.id, payload);
      setEditingEntry(null);
    } catch (err) { }
  }

  const handleDeleteEntry = async () => {
    try {
      await removeEntry(deleteTargetId);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } catch (err) { }
  }

  const handleReversePayment = async () => {
    if (reverseConfirmText !== 'REVERSE') return
    try {
      setIsReversing(true)
      toast.loading('Processing financial reversal...', { id: 'reverse' })
      await adminService.reversePayment(reverseTarget.id, reverseReason)
      toast.success('Payment Reverted & Voided successfully', { id: 'reverse' })
      setReverseTarget(null)
    } catch (err) {
      toast.error(err.message || 'Legacy reversal failed', { id: 'reverse' })
    } finally {
      setIsReversing(false)
    }
  }

  const handleCSVExport = () => {
    const exportCols = [
      { header: 'Ref ID', accessor: 'id' },
      { header: 'Member', accessor: 'profiles.full_name' },
      { header: 'Amount', accessor: 'amount' },
      { header: 'Type', accessor: 'transaction_type' },
      { header: 'Category', accessor: 'reference_type' },
      { header: 'Date', accessor: 'created_at' }
    ]
    const data = filteredLedger.map(l => ({
      ...l,
      'profiles.full_name': l.profiles?.full_name || 'System'
    }))
    exportToCSV(data, exportCols, `SreemNidhi_Ledger_${new Date().toISOString().split('T')[0]}`)
    toast.success('Ledger exported to CSV')
  }

  const handlePDFExport = () => {
    const exportCols = [
      { header: 'Ref ID', accessor: 'id' },
      { header: 'Member', accessor: 'profiles.full_name' },
      { header: 'Type', accessor: 'transaction_type' },
      { header: 'Amount', accessor: 'amount' },
      { header: 'Date', accessor: 'created_at' }
    ]
    const data = filteredLedger.map(l => ({
      ...l,
      'profiles.full_name': l.profiles?.full_name || 'System',
      id: 'REF-' + l.id.slice(0, 8).toUpperCase()
    }))
    exportToPDF(data, exportCols, 'Institutional Ledger Audit')
    toast.success('Audit report generated in PDF')
  }

  return (
    <div className="animate-in fade-in duration-1000">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <History className="w-5 h-5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Financial Protocol</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Institutional Ledger</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Audited movements across the trust's digital vaults.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white rounded-full p-1 border border-brand-gold/10 shadow-sm">
            <button onClick={handleCSVExport} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#2B2620] hover:bg-brand-gold/5 rounded-full transition-all">CSV</button>
            <button onClick={handlePDFExport} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#2B2620] hover:bg-brand-gold/5 rounded-full transition-all">PDF Report</button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="heritage-gradient px-8 py-3.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 shadow-xl hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Record New Entry
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Cumulative Inflow', value: displayStats.credits, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Institutional Outflow', value: displayStats.debits, icon: CreditCard, color: 'text-red-500', bg: 'bg-red-50/50' },
          { label: 'Net Asset Balance', value: displayStats.balance, icon: Activity, color: 'text-brand-gold', bg: 'bg-brand-gold/5' }
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex gap-6 items-center shadow-sm group hover:scale-[1.02] transition-all`}>
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-headline font-bold text-[#2B2620]`}>₹{Math.abs(item.value).toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60 mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filtering */}
      <div className="relative z-10 bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-brand-gold/5 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Main Search */}
          <div className="relative group w-full lg:flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-5 h-5" />
            <input
              className="w-full bg-white border-2 border-brand-gold/5 rounded-2xl py-4 pl-16 pr-8 text-sm font-body focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/30 focus:outline-none transition-all placeholder:text-brand-text/10 shadow-sm"
              placeholder="Search Ref ID, Member Identity, or Security Protocol..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-end">
            {/* Type Pills */}
            <div className="p-1 bg-brand-ivory rounded-xl flex gap-1">
              {['all', 'credit', 'debit'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all ${typeFilter === type
                      ? 'bg-white text-[#2B2620] shadow-sm'
                      : 'text-brand-text/40 hover:text-[#2B2620]'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Date Range (Prompt 5) */}
            <DateRangePicker
              startDate={dateFrom}
              endDate={dateTo}
              onChange={(start, end) => {
                setDateFrom(start);
                setDateTo(end);
              }}
            />
          </div>
        </div>
      </div>

      <div className="soft-glow bg-white/20 rounded-[2.5rem] border border-brand-gold/5 overflow-visible">
        <DataTable
          columns={columns}
          data={filteredLedger}
          loading={loading}
          onRowClick={(row) => setSelectedEntry(row)}
        />
        {!loading && filteredLedger.length === 0 && (
          <div className="text-center py-20 bg-white/10 rounded-b-[2.5rem]">
            <History className="w-12 h-12 text-brand-gold/20 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#2B2620]/30 uppercase tracking-[0.2em]">No ledger records found in this protocol.</p>
          </div>
        )}
      </div>

      <footer className="mt-16 text-center">
        <div className="inline-flex items-center gap-4 px-8 py-3.5 bg-[#2B2620]/5 rounded-full border border-brand-gold/10 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000">
          <ShieldCheck className="w-5 h-5 text-brand-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2B2620]">Cryptographic Proof Verified at Institutional Grade</span>
        </div>
      </footer>

      {/* Modals */}
      <LedgerFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateEntry}
        members={members}
      />

      <LedgerFormModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleUpdateEntry}
        initialData={editingEntry}
        members={members}
      />

      <LedgerDetailModal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />

      <Modal
        isOpen={!!memberDrilldown}
        onClose={() => setMemberDrilldown(null)}
        title={`${memberDrilldown?.fullName}'s Institutional Ledger`}
        maxWidth="max-w-6xl"
      >
        <div className="p-4">
           <DataTable 
             columns={columns.filter(c => c.header !== 'Account Identity')} 
             data={ledger.filter(l => l.user_id === memberDrilldown?.userId)} 
             loading={loading}
           />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteEntry}
        title="Delete Institutional Record?"
        description="This action will expunge this financial entry from the immutable ledger. This protocol modification is recorded for audit."
        intent="danger"
      />

      <Modal
        isOpen={!!reverseTarget}
        onClose={() => setReverseTarget(null)}
        title="Admin Override: Revert Entry"
      >
        <div className="space-y-6">
          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
            <Activity className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-amber-900 leading-relaxed font-bold">Reversal Audit Trail</p>
              <p className="text-[10px] text-amber-800 leading-relaxed mt-1">
                Reversing Ref: {reverseTarget?.id.slice(0, 12)} for {reverseTarget?.profiles?.full_name}.
                This will credited back the member's outstanding balance & void the contribution record.
              </p>
            </div>
          </div>

          <div className="space-y-4 font-body">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">Reason for Override</label>
              <textarea
                className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/30 h-24"
                placeholder="Describe the error leading to this reversal..."
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">Confirm Sequence</label>
              <p className="text-[9px] mb-2 opacity-50 italic">Type "REVERSE" to authorize institutional reversal.</p>
              <input
                type="text"
                className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 text-sm font-bold uppercase focus:outline-none focus:border-brand-gold/30"
                placeholder="Sequence Match"
                value={reverseConfirmText}
                onChange={(e) => setReverseConfirmText(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleReversePayment}
            disabled={reverseConfirmText !== 'REVERSE' || isReversing}
            className={`w-full font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${reverseConfirmText === 'REVERSE'
                ? 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            Commit Reversal <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Ledger
