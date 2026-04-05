import { Phone, Mail, LayoutGrid, Calendar, ArrowUpRight, User, Wallet, AlertCircle, Briefcase } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import RiskBadge from '../../../shared/components/ui/RiskBadge'

const MemberQuickViewModal = ({ isOpen, onClose, member, onViewFull }) => {
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ')
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('')
  }

  if (!member) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Identity Overview">
      <div className="flex flex-col items-center text-center mb-8 relative">
        <div className="absolute top-0 right-0">
           <RiskBadge level={member.risk.level} reason={member.risk.reason} />
        </div>
        <div className="w-24 h-24 rounded-full heritage-gradient flex items-center justify-center text-white text-3xl font-black shadow-2xl mb-4 ring-4 ring-brand-gold/10">
          {getInitials(member.profiles?.full_name)}
        </div>
        <h3 className="text-2xl font-headline font-bold text-[#2B2620]">{member.profiles?.full_name || 'Anonymous'}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mt-1 underline decoration-brand-gold/30 underline-offset-4">Verified Financial Beneficiary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Contact Info (Compact) */}
        <div className="bg-brand-ivory/30 p-4 rounded-2xl border border-brand-gold/5 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-1">
            <Phone className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/40">Secure Contact</span>
            <Phone className="w-3.5 h-3.5 text-brand-gold" />
          </div>
          <p className="text-sm font-bold text-[#2B2620] ml-6.5">{member.profiles?.mobile_number || 'Not Provided'}</p>
        </div>

        <div className="bg-brand-ivory/30 p-4 rounded-2xl border border-brand-gold/5 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-1">
            <LayoutGrid className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/40">Active Portfolio</span>
            <Briefcase className="w-3.5 h-3.5 text-brand-gold" />
          </div>
          <p className="text-sm font-bold text-[#2B2620] ml-6.5">{member.chits?.name || 'Unassigned'}</p>
        </div>

        {/* Financial Diagnostics */}
        <div className="bg-brand-gold/5 p-4 rounded-2xl border border-brand-gold/10">
          <div className="flex items-center gap-3 mb-1 text-brand-goldDark">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Invested</span>
          </div>
          <p className="text-xl font-headline font-bold text-[#2B2620]">₹{(member.total_contribution || 0).toLocaleString()}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
          <div className="flex items-center gap-3 mb-1 text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Liability</span>
          </div>
          {(() => {
            const monthsElapsed = Math.floor((Date.now() - new Date(member.joined_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
            const expected = (member.chits?.monthly_amount || 0) * monthsElapsed
            const pending = Math.max(0, expected - (member.total_contribution || 0))
            return <p className={`text-xl font-headline font-bold ${pending > 0 ? 'text-red-500' : 'text-green-600'}`}>₹{pending.toLocaleString()}</p>
          })()}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-[#2B2620] rounded-2xl border border-white/5 mb-8 shadow-inner">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 leading-none">Standing</span>
          <StatusBadge status={member.status} />
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block leading-none">System Ref</span>
           <span className="font-mono text-[10px] font-bold text-brand-gold">SHR-{member.id.toUpperCase().slice(0, 8)}</span>
        </div>
      </div>

      <button
        onClick={() => onViewFull(member.id)}
        className="flex-1 px-8 py-4 bg-brand-ivory text-[#2B2620] text-[10px] font-black uppercase tracking-widest rounded-2xl border border-brand-gold/10 hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-3"
      >
        <ArrowUpRight className="w-4 h-4" />
        Enter Deep Profile Analysis
      </button>
    </Modal>
  )
}

export default MemberQuickViewModal
