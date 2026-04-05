import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  AlertTriangle, 
  Search, 
  Send, 
  User, 
  ChevronRight,
  ShieldAlert,
  Clock,
  ArrowRightCircle,
  ShieldCheck
} from 'lucide-react'
import { notificationService } from '../notifications/api'
import { useRiskAnalysis } from './hooks/useRiskAnalysis'
import DataTable from '../../shared/components/ui/DataTable'
import toast from 'react-hot-toast'

const RiskPanel = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { defaulters, isLoading: loading } = useRiskAnalysis()

  const getRiskLevel = (row) => {
    const totalDue = Number(row.total_overdue_amount) + Number(row.total_paid_amount || 0)
    const paidRatio = totalDue > 0 ? (Number(row.total_paid_amount || 0) / totalDue) * 100 : 100
    
    if (row.overdue_count > 0 || paidRatio < 60) return { label: 'HIGH', color: 'text-red-600 bg-red-50', icon: ShieldAlert, restricted: true }
    if (paidRatio < 90) return { label: 'MEDIUM', color: 'text-amber-600 bg-amber-50', icon: Clock, restricted: false }
    return { label: 'LOW', color: 'text-green-600 bg-green-50', icon: ShieldCheck, restricted: false }
  }

  const handleSendReminder = async (defaulter) => {
    try {
      toast.loading(`Dispatching recovery protocol to ${defaulter.full_name}...`, { id: 'rem' })
      const userId = defaulter.user_id
      const chitId = defaulter.chit_id
      
      await notificationService.sendReminder(userId, chitId, defaulter.total_overdue_amount)
      toast.success('Recovery signal sent!', { id: 'rem' })
    } catch (error) {
      toast.error('Dispatch failure', { id: 'rem' })
    }
  }

  const handleMassReminder = async () => {
    try {
      toast.loading('Initializing mass recovery dispatch...', { id: 'mass' })
      await Promise.all(defaulters.map(d => {
        const userId = d.user_id
        const chitId = d.chit_id
        return notificationService.sendReminder(userId, chitId, d.total_overdue_amount)
      }))
      toast.success(`Broadcasting complete: ${defaulters.length} accounts notified.`, { id: 'mass' })
    } catch (err) {
      toast.error('Incomplete dispatch sequence')
    }
  }

  const filteredData = defaulters.filter(d => 
    d.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.profiles?.mobile_number?.includes(searchTerm)
  )

  const columns = [
    {
      header: 'Delegate Participant',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center font-bold text-sm text-brand-gold border border-brand-gold/10">
            {row.profiles?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-[#2B2620]">{row.profiles?.full_name || 'Anonymous'}</span>
            <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">{row.profiles?.mobile_number || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Scheme',
      render: (row) => <span className="font-bold text-[#2B2620]">{row.chits?.name || 'Unassigned'}</span>
    },
    {
      header: 'Lapsed Cycles',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-brand-gold">{row.overdue_count} Month(s)</span>
        </div>
      )
    },
    {
      header: 'Deficit Total',
      render: (row) => <span className="font-black text-red-600">₹{Number(row.total_overdue_amount).toLocaleString()}</span>
    },
    {
      header: 'Risk Classification',
      render: (row) => {
        const risk = getRiskLevel(row)
        return (
          <div className="flex flex-col gap-1.5">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit ${risk.color}`}>
              <risk.icon className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black tracking-widest uppercase">{risk.label}</span>
            </div>
            {risk.restricted && (
              <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter opacity-70 ml-2 italic">
                * Auction Restricted
              </span>
            )}
          </div>
        )
      }
    },
    {
      header: 'Countermeasures',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleSendReminder(row)}
            className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all"
            title="Dispatch Recovery Command"
          >
            <Send className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/members/${row.user_id}`)}
            className="p-2 text-[#2B2620] hover:bg-[#2B2620]/5 rounded-xl transition-all"
            title="Dossier Inspection"
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/finance/ledger?userId=${row.user_id}`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
            title="Audit Full Ledger"
          >
            <ArrowRightCircle className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 text-red-600 mb-2">
             <AlertTriangle className="w-6 h-6" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Threat Matrix</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Defaulter & Risk Panel</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Detect financial anomalies and execute recovery protocols.</p>
        </div>
        
        <div className="flex gap-4">
           {defaulters.length > 0 && (
             <button 
               onClick={handleMassReminder}
               className="heritage-gradient text-white px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
             >
               <Send className="w-4 h-4" /> Mass Recovery Dispatch
             </button>
           )}
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search threat matrix..."
                className="w-80 bg-white border-2 border-brand-gold/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/30 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-xl overflow-hidden">
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </div>
    </div>
  )
}

export default RiskPanel
