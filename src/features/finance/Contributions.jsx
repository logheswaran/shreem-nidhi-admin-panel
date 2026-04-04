import React, { useEffect, useState } from 'react'
import { IndianRupee, Search, Filter, Calendar } from 'lucide-react'
import { financeService } from './api'
import { chitService } from '../chits/api'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import toast from 'react-hot-toast'

const Contributions = () => {
  const [contributions, setContributions] = useState([])
  const [chits, setChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ chitId: '', month: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contData, chitData] = await Promise.all([
        financeService.getContributions(filters.chitId, filters.month),
        chitService.getChits()
      ])
      setContributions(contData)
      setChits(chitData)
    } catch (error) {
      toast.error('Failed to load contributions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleMarkPaid = async (row) => {
    try {
      toast.loading('Recording premium receipt...', { id: 'cont' })
      await financeService.recordContribution(row.member_id, row.month_number, row.amount)
      toast.success('Beneficiary ledger updated!', { id: 'cont' })
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to record payment', { id: 'cont' })
    }
  }

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
      header: 'Admittance', 
      render: (row) => row.status === 'pending' ? (
        <button 
          onClick={(e) => { e.stopPropagation(); handleMarkPaid(row); }}
          className="bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full hover:bg-brand-goldDark transition-all shadow-md active:scale-95"
        >
          Verify Payment
        </button>
      ) : (
        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Cleared</span>
      )
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
             <span className="text-xl font-headline font-bold text-[#2B2620]">{contributions.length}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold opacity-50 mt-1">Delegates</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-xl font-headline font-bold text-green-600">{contributions.filter(c => c.status === 'paid').length}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold opacity-50 mt-1">Authorized</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-xl font-headline font-bold text-red-500">{contributions.filter(c => c.status === 'pending').length}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold opacity-50 mt-1">Overdue</span>
           </div>
        </div>
      </div>

      <DataTable columns={columns} data={contributions} loading={loading} />
    </div>
  )
}

export default Contributions
