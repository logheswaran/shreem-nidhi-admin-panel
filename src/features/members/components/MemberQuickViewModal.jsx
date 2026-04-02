import React from 'react'
import { Phone, Mail, LayoutGrid, Calendar, ArrowUpRight, User } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import StatusBadge from '../../../shared/components/ui/StatusBadge'

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
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 rounded-full heritage-gradient flex items-center justify-center text-white text-3xl font-black shadow-2xl mb-4 ring-4 ring-brand-gold/10">
          {getInitials(member.profiles?.full_name)}
        </div>
        <h3 className="text-2xl font-headline font-bold text-brand-navy">{member.profiles?.full_name || 'Anonymous'}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mt-1">Identity Verified</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-brand-ivory/30 p-4 rounded-2xl border border-brand-gold/5">
          <div className="flex items-center gap-3 mb-1">
            <Phone className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40">Secure Phone</span>
          </div>
          <p className="text-sm font-bold text-brand-navy ml-6.5">{member.profiles?.mobile_number || 'Not Provided'}</p>
        </div>

        <div className="bg-brand-ivory/30 p-4 rounded-2xl border border-brand-gold/5">
          <div className="flex items-center gap-3 mb-1">
            <Mail className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40">Portal Email</span>
          </div>
          <p className="text-sm font-bold text-brand-navy ml-6.5 truncate">{member.profiles?.email || 'N/A'}</p>
        </div>

        <div className="bg-brand-ivory/30 p-4 rounded-2xl border border-brand-gold/5">
          <div className="flex items-center gap-3 mb-1">
            <LayoutGrid className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40">Assigned Chit</span>
          </div>
          <p className="text-sm font-bold text-brand-navy ml-6.5">{member.chits?.name || 'Unassigned'}</p>
        </div>

        <div className="bg-brand-ivory/30 p-4 rounded-2xl border border-brand-gold/5">
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40">Enrollment Date</span>
          </div>
          <p className="text-sm font-bold text-brand-navy ml-6.5">
            {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10 mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 mb-1">Standing</span>
          <StatusBadge status={member.status} />
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 mb-1 block">Reference</span>
           <span className="font-mono text-xs font-bold text-brand-goldDark">MOD-{member.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      <button
        onClick={() => onViewFull(member.id)}
        className="w-full heritage-gradient py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        <ArrowUpRight className="w-4 h-4" />
        Enter Deep Profile Analysis
      </button>
    </Modal>
  )
}

export default MemberQuickViewModal
