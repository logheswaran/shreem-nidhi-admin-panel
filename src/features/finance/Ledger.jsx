import React, { useEffect, useState } from 'react'
import { History, Search, Download, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, Database } from 'lucide-react'
import { financeService } from './api'
import DataTable from '../../shared/components/ui/DataTable'
import { exportToCSV, exportToPDF } from '../../shared/utils/exportUtils'
import toast from 'react-hot-toast'

const Ledger = () => {
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true)
        const data = await financeService.getLedger()
        setLedger(data)
      } catch (error) {
        toast.error('Failed to sync with secure ledger')
      } finally {
        setLoading(false)
      }
    }
    fetchLedger()
  }, [])

  const filteredLedger = ledger.filter(l => 
    l.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.id.includes(searchTerm)
  )

  const columns = [
    { 
      header: 'Entry Reference', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${row.transaction_type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {row.transaction_type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-bold text-brand-text/30 uppercase tracking-tighter">REF-{row.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-xs font-bold text-brand-navy capitalize">{row.reference_type.replace('_', ' ')}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Account Identity', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-brand-navy group-hover:text-brand-gold transition-colors">{row.profiles?.full_name || 'System Protocol'}</span>
          <span className="text-[10px] text-brand-text/30 font-bold tracking-widest uppercase">{row.chits?.name || 'Institutional'}</span>
        </div>
      )
    },
    { 
      header: 'Capital Impact', 
      render: (row) => (
        <span className={`font-headline font-bold text-lg ${row.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.transaction_type === 'credit' ? '+' : '-'} ₹{Number(row.amount).toLocaleString()}
        </span>
      )
    },
    { 
      header: 'Verification', 
      render: (row) => (
        <div className="flex items-center gap-2 text-brand-text/40">
          <ShieldCheck className="w-4 h-4 text-brand-gold/40" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(row.created_at).toLocaleString()}</span>
        </div>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Institutional Ledger</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">The immutable record of all SreemNidhi trust movements. Verified by secure protocol.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              const exportCols = [
                { header: 'Ref ID', accessor: 'id' },
                { header: 'Member', accessor: 'profiles' },
                { header: 'Type', accessor: 'transaction_type' },
                { header: 'Category', accessor: 'reference_type' },
                { header: 'Amount', accessor: 'amount' },
                { header: 'Date', accessor: 'created_at' },
              ]
              const exportData = filteredLedger.map(l => ({
                ...l,
                profiles: l.profiles?.full_name || 'System'
              }))
              exportToCSV(exportData, exportCols, 'SreemNidhi_Ledger')
              toast.success('Ledger exported as CSV')
            }}
            className="bg-white px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm flex items-center gap-3 active:scale-95"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button 
            onClick={() => {
              const exportCols = [
                { header: 'Ref ID', accessor: 'id' },
                { header: 'Member', accessor: 'profiles' },
                { header: 'Type', accessor: 'transaction_type' },
                { header: 'Amount', accessor: 'amount' },
                { header: 'Date', accessor: 'created_at' },
              ]
              const exportData = filteredLedger.map(l => ({
                ...l,
                profiles: l.profiles?.full_name || 'System',
                id: 'REF-' + l.id.slice(0, 8).toUpperCase()
              }))
              exportToPDF(exportData, exportCols, 'SreemNidhi Institutional Ledger')
            }}
            className="heritage-gradient px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:brightness-110 transition-all flex items-center gap-3 active:scale-95"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </header>

      {/* Ledger Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex gap-5 items-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center"><ArrowDownLeft className="text-green-600 w-7 h-7" /></div>
            <div>
              <p className="text-2xl font-headline font-bold text-brand-navy leading-none">₹{ledger.filter(l => l.transaction_type === 'credit').reduce((s,l) => s + Number(l.amount), 0).toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60 mt-2">Total Inflow</p>
            </div>
         </div>
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex gap-5 items-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center"><ArrowUpRight className="text-red-600 w-7 h-7" /></div>
            <div>
              <p className="text-2xl font-headline font-bold text-brand-navy leading-none">₹{ledger.filter(l => l.transaction_type === 'debit').reduce((s,l) => s + Number(l.amount), 0).toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60 mt-2">Total Outflow</p>
            </div>
         </div>
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex gap-5 items-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center"><Database className="text-brand-gold w-7 h-7" /></div>
            <div>
              <p className="text-2xl font-headline font-bold text-brand-navy leading-none">{ledger.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60 mt-2">Audited Entries</p>
            </div>
         </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-5 h-5" />
        <input 
          className="w-full bg-white border-2 border-brand-gold/5 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-body focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/30 focus:outline-none transition-all shadow-sm placeholder:text-brand-text/10"
          placeholder="Search by Transaction ID or Member Identity..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={filteredLedger} loading={loading} />
      
      <footer className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-gold/5 rounded-full border border-brand-gold/10 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <ShieldCheck className="w-4 h-4 text-brand-gold" />
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-navy">Cryptographic Proof Verified</span>
        </div>
      </footer>
    </div>
  )
}

export default Ledger
