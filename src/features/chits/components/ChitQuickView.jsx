import React from 'react'
import { 
  TrendingUp, Users, Clock, 
  AlertCircle, ShieldCheck, 
  TrendingDown, ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { getChitFinancials } from '../api'
import GlobalModal from '../../../shared/components/ui/GlobalModal'

/**
 * FEATURE: Chit Quick View (Standardized Refactor)
 * Standardized using the central GlobalModal framework.
 */
const ChitQuickView = ({ chit, isOpen, onClose }) => {
  const { data: financials } = useQuery({
    queryKey: ['chit_financials_quick', chit?.id],
    queryFn: () => getChitFinancials(chit?.id),
    enabled: !!chit?.id,
    staleTime: 60000
  })

  if (!chit) return null

  const monthly = Number(chit.monthly_contribution || 0)
  const max = Number(chit.max_members || 0)
  const totalValue = monthly * max
  const members = Number(chit.members_count || 0)
  const current = Number(chit.current_month || 0)
  const duration = Number(chit.total_months || 0)

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={chit.name}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col">
        {/* Header Metadata */}
        <div className="flex items-center justify-between -mt-6 mb-8">
          <div className="flex items-center gap-3">
            <StatusBadge status={chit.status} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold">
              {chit.chit_type} Methodology
            </span>
          </div>
          <span className="text-[9px] font-bold text-brand-text/30 uppercase tracking-widest">
            UUID: {String(chit.id || '').slice(0, 8)}
          </span>
        </div>

        {/* Content Section: Grid Compactness Pass */}
        <div className="space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#FDFCF7] p-6 rounded-2xl border border-brand-gold/10 flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/40 mb-1">Maturity Value</p>
                <p className="text-2xl font-headline font-bold text-brand-gold">₹{totalValue.toLocaleString()}</p>
             </div>
             <div className="bg-[#FDFCF7] p-6 rounded-2xl border border-brand-gold/10 flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/40 mb-1">Monthly Subs</p>
                <p className="text-2xl font-headline font-bold text-[#2B2620]">₹{monthly.toLocaleString()}</p>
             </div>
          </div>

          {/* Operational Intelligence */}
          <div className="space-y-4">
             <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-[#2B2620]/30 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-brand-gold" />
               Solvency Intelligence
             </h3>
             <div className="grid grid-cols-1 gap-4">
               <div className="p-6 bg-brand-gold/5 rounded-2xl border border-brand-gold/10 space-y-1">
                 <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/40">Realized Collection</p>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {financials && totalValue > 0 ? ((financials.collected / totalValue) * 100).toFixed(1) : 0}% Yield
                    </div>
                 </div>
                 <p className="text-xl font-bold text-[#2B2620]">₹{financials?.collected.toLocaleString() || '0'}</p>
               </div>
               
               <div className={`p-6 rounded-2xl border transition-all ${financials?.pending > 0 ? 'bg-red-50/50 border-red-100' : 'bg-[#FDFCF7] border-brand-gold/10'}`}>
                 <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/40">Active Overage</p>
                    <div className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${financials?.pending > 0 ? 'text-red-500' : 'text-brand-text/20'}`}>
                      <TrendingDown className="w-4 h-4" />
                      {financials?.defaults || 0} Delinquencies
                    </div>
                 </div>
                 <p className={`text-xl font-bold ${financials?.pending > 0 ? 'text-red-600' : 'text-[#2B2620]'}`}>
                    ₹{financials?.pending.toLocaleString() || '0'}
                 </p>
               </div>
             </div>
          </div>

          {/* Participation & Lifecycle Grid */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#B6955E]/10">
            <div className="space-y-3">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2B2620]/30">Engagement</h3>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-brand-gold text-white flex items-center justify-center font-headline font-bold text-lg shadow-xl shadow-brand-gold/20">
                    {members}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#2B2620] tracking-widest uppercase">{members >= max ? 'LIQUID' : 'FORMING'}</span>
                    <span className="text-[9px] text-brand-text/40 font-bold uppercase">Target: {max}</span>
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2B2620]/30">Lifecycle</h3>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white border border-[#B6955E]/20 flex items-center justify-center text-[#2B2620] font-headline font-bold text-lg shadow-sm">
                    {current}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#2B2620] tracking-widest uppercase">{current >= duration ? 'MATURED' : `MNTH ${current}`}</span>
                    <span className="text-[9px] text-brand-text/40 font-bold uppercase">Tenure: {duration}</span>
                 </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-[#B6955E]/10 space-y-4">
           {financials?.defaults > 0 && (
             <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-900 leading-tight font-bold uppercase tracking-wider">
                  Administrative Intervention required: High risk threshold breached.
                </p>
             </div>
           )}

           <Link 
            to={`/chits/${chit.id}`}
            className="w-full heritage-gradient text-white rounded-2xl py-5 font-bold text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand-gold/20"
           >
             Management Console
             <ArrowUpRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </GlobalModal>
  )
}

export default ChitQuickView
