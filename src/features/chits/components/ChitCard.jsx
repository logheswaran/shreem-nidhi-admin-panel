import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowUpRight, Users, Clock, Hash, 
  TrendingUp, AlertCircle, ShieldCheck, 
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import ActionButtons from './ActionButtons'
import { getChitFinancials } from '../api'

const ChitCard = ({ chit, onQuickView }) => {
  const { data: financials } = useQuery({
    queryKey: ['chit_financials', chit.id],
    queryFn: () => getChitFinancials(chit.id),
    staleTime: 60000
  })

  // Data Normalization
  const monthly = Number(chit.monthly_contribution || 0)
  const max = Number(chit.max_members || 0)
  const totalValue = monthly * max
  const members = Number(chit.members_count || 0)
  const current = Number(chit.current_month || 0)
  const duration = Number(chit.total_months || 0)

  // Health Status Logic: Heritage Compliant
  const getHealth = () => {
    if (!financials) return { level: 'HEALTHY', label: 'Verifying...', color: 'text-brand-text/30' }
    if (financials.defaults >= 2 || (financials.pending > totalValue * 0.3)) {
      return { level: 'CRITICAL', label: 'CRITICAL', color: 'text-red-600', icon: <AlertCircle className="w-3 h-3" /> }
    }
    if (financials.defaults >= 1 || financials.pending > 0) {
      return { level: 'AT_RISK', label: 'AT RISK', color: 'text-amber-600', icon: <AlertCircle className="w-3 h-3" /> }
    }
    return { level: 'HEALTHY', label: 'HEALTHY', color: 'text-green-600', icon: <ShieldCheck className="w-3 h-3" /> }
  }

  const getNextAction = () => {
    if (chit.status === 'forming') return 'Admit Members'
    if (chit.status === 'completed' || (duration > 0 && current >= duration)) return 'Maturity'
    if (chit.chit_type === 'random') return 'Random Pick'
    return 'Start Auction'
  }

  const health = getHealth()

  return (
    <div 
      className="group bg-white rounded-[2rem] border border-brand-gold/15 p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden relative min-h-[460px]"
      onClick={() => onQuickView?.(chit)}
    >
      {/* Subtle Risk Glow */}
      {health.level === 'CRITICAL' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] pointer-events-none" />
      )}

      {/* 📐 Header Alignment: Svarnam Standard */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-headline font-bold text-[#2B2620] leading-tight line-clamp-1 group-hover:text-brand-gold transition-colors">
            {chit.name}
          </h3>
          <div className="flex gap-2 items-center mt-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
              chit.chit_type === 'random' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-brand-gold/5 text-brand-gold border-brand-gold/10'
            }`}>
              {chit.chit_type}
            </span>
            <StatusBadge status={chit.status} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${health.color} bg-current/5 border border-current/10 shrink-0`}>
            {health.icon}
            <span className="text-[8px] font-black tracking-widest">{health.label}</span>
          </div>
          <Link 
            to={`/chits/${chit.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-xl bg-brand-ivory border border-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all transform group-hover:scale-105 shrink-0 shadow-sm"
          >
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* 📊 Value Blocks Grid: Requirement 6 */}
      <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
        <div className="bg-brand-ivory/50 p-4 rounded-2xl border border-brand-gold/5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-brand-text/50 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2B2620]/40">Total Val</span>
          </div>
          <p className="font-headline font-bold text-2xl text-[#2B2620] tracking-tighter truncate">
            ₹{totalValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-brand-ivory/50 p-4 rounded-2xl border border-brand-gold/5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-brand-text/50 mb-1.5">
            <Users className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2B2620]/40">Capacity</span>
          </div>
          <p className="font-headline font-bold text-2xl text-[#2B2620] tracking-tighter">
            {members} <span className="text-base opacity-30 font-medium">/ {max}</span>
          </p>
        </div>

        {/* 📈 Collection Section: Requirement 7 */}
        <div className="col-span-2 bg-brand-ivory p-4 rounded-[1.5rem] border border-brand-gold/5 shadow-inner mt-4">
          <div className="flex justify-between items-center mb-1.5">
             <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2B2620]/60">Collection</span>
             </div>
             {financials && (
               <span className="text-[9px] font-bold text-brand-gold bg-white px-2 py-0.5 rounded-full border border-brand-gold/5">
                 ₹{financials.collected.toLocaleString()}
               </span>
             )}
          </div>
          
          <div className="w-full bg-white h-2 rounded-full overflow-hidden flex border border-brand-gold/5 mt-2">
             <div 
                className="bg-brand-gold h-full transition-all duration-1000 ease-out"
                style={{ width: financials ? `${Math.min(100, (financials.collected / (totalValue || 1)) * 100)}%` : '0%' }}
             />
             <div 
                className="bg-red-400 h-full transition-all duration-1000 ease-out"
                style={{ width: financials ? `${Math.min(100, (financials.pending / (totalValue || 1)) * 100)}%` : '0%' }}
             />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-text/50">
              Month {current} <span className="opacity-30 font-medium">/</span> {duration}
            </span>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-brand-gold/10 shadow-sm">
              <ArrowRight className="w-3 h-3 text-brand-gold" />
              <span className="text-[9px] font-black uppercase text-[#2B2620] tracking-tighter">
                {getNextAction()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔘 Button Section: Requirement 8 */}
      <div onClick={(e) => e.stopPropagation()} className="relative z-10">
        <ActionButtons chit={chit} />
      </div>
      
    </div>
  )
}

export default ChitCard
