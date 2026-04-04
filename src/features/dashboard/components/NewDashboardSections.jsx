import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ShieldCheck, CheckCircle2, LayoutGrid, ArrowRight, PlusCircle } from 'lucide-react'

// Layout wrapper for consistent card styling
const DashboardCard = ({ children, className = "" }) => (
  <div className={`bg-[var(--bg-card)] p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex flex-col h-full transition-colors duration-300 ${className}`}>
    {children}
  </div>
)

// A. Overdue Contributions Alert
export const OverdueAlert = ({ overdue = [] }) => {
  if (!overdue || overdue.length === 0) {
    return (
      <DashboardCard className="border-green-500/10 bg-green-50/5">
        <div className="flex items-center gap-4 text-green-600">
          <CheckCircle2 className="w-5 h-5 flex items-center" />
          <span className="text-[11px] font-black uppercase tracking-widest leading-none">All contributions up to date</span>
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard className="border-red-500/20 bg-red-50/5">
      <div className="flex items-center gap-3 text-red-600 mb-4">
        <AlertCircle className="w-5 h-5 flex items-center" />
        <span className="text-[11px] font-black uppercase tracking-widest">{overdue.length} Contributions Overdue</span>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[120px] pr-2 no-scrollbar">
        {overdue.map((c, idx) => (
          <div key={idx} className="flex justify-between items-center text-[11px] font-bold py-2 border-b border-red-500/5 last:border-0">
            <span className="text-[var(--text-primary)]">{c.full_name}</span>
            <span className="text-red-500">₹{Number(c.amount_due).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

// B. Active Loan Health Panel
export const LoanHealth = ({ stats }) => {
  if (!stats) return null;
  const { count, totalOutstanding, needingUpdate } = stats;

  return (
    <DashboardCard>
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-5 h-5 flex items-center text-[#BA7517]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Active Loan Health</span>
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-end border-b border-brand-gold/5 pb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 opacity-70">Circulating Exposure</p>
            <p className="text-xl font-headline font-bold text-[var(--text-primary)]">₹{totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 opacity-70">Volume</p>
            <p className="text-xl font-headline font-bold text-[var(--text-primary)]">{count} Active</p>
          </div>
        </div>
        
        {needingUpdate > 0 && (
          <div className="pt-2 flex items-center gap-3">
             <div className="px-3 py-1 bg-[#FFFBEB] text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-600/10 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Interest update needed ({needingUpdate})
             </div>
          </div>
        )}
      </div>
    </DashboardCard>
  )
}

// C. Pending Member Applications Badge
export const PendingAppsBadge = ({ count }) => {
  const navigate = useNavigate()
  if (!count || count === 0) return null;

  return (
    <DashboardCard className="border-brand-gold/40 shadow-lg shadow-brand-gold/10">
      <div className="flex justify-between items-center h-full">
        <div>
          <h4 className="text-xl font-headline font-bold text-[var(--text-primary)] leading-none mb-2">{count} Applications</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BA7517] opacity-60">Awaiting Approval Protocol</p>
        </div>
        <button 
          onClick={() => navigate('/applications')}
          className="p-4 bg-brand-gold/10 hover:bg-brand-gold text-[#BA7517] hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center group"
        >
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </DashboardCard>
  )
}

// D. Chit Progress Tracker
export const ChitProgressTracker = ({ chits = [] }) => {
  const navigate = useNavigate()

  if (!chits || chits.length === 0) {
    return null
  }

  return (
    <DashboardCard>
      <div className="flex items-center gap-3 mb-6">
        <LayoutGrid className="w-5 h-5 flex items-center text-[var(--text-primary)]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Global Chit Progress Tracker</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {chits.map((chit, idx) => {
          const progress = Math.round((chit.current_month / chit.duration_months) * 100)
          return (
            <div key={idx} className="p-4 bg-[var(--bg-inner)] rounded-2xl border border-brand-gold/5 flex flex-col gap-3 transition-colors duration-300">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-[var(--text-primary)]">{chit.name}</span>
                <span className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-60">Month {chit.current_month}/{chit.duration_months}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-[var(--status-warning)] transition-all duration-700" 
                   style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
