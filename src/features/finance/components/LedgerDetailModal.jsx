import React from 'react'
import { Hash, User, LayoutGrid, ArrowDownLeft, ArrowUpRight, Clock, FileText, Database, ShieldCheck } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'

const LedgerDetailModal = ({ isOpen, onClose, entry }) => {
  if (!entry) return null

  const isCredit = entry.transaction_type === 'credit'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Financial Audit Detail">
      {/* Transaction Status Header */}
      <div className={`p-6 rounded-[2rem] mb-8 flex flex-col items-center text-center ${isCredit ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isCredit ? <ArrowDownLeft className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
        </div>
        <p className={`text-3xl font-headline font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'} ₹{Number(entry.amount).toLocaleString()}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/40 mt-2">
          {entry.transaction_type} Transaction Verified
        </p>
      </div>

      {/* Core Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-brand-ivory/40 p-4 rounded-2xl border border-brand-gold/5 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm"><Hash className="w-4 h-4 text-brand-gold" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 mb-1">Reference ID</p>
            <p className="font-mono text-xs font-bold text-brand-navy">REF-{entry.id.slice(0, 12).toUpperCase()}</p>
          </div>
        </div>

        <div className="bg-brand-ivory/40 p-4 rounded-2xl border border-brand-gold/5 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm"><User className="w-4 h-4 text-brand-gold" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 mb-1">Associated Member</p>
            <p className="text-sm font-bold text-brand-navy">{entry.profiles?.full_name || 'System Protocol'}</p>
          </div>
        </div>

        <div className="bg-brand-ivory/40 p-4 rounded-2xl border border-brand-gold/5 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm"><LayoutGrid className="w-4 h-4 text-brand-gold" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 mb-1">Portfolio Source</p>
            <p className="text-sm font-bold text-brand-navy">{entry.chits?.name || 'Institutional Reserve'}</p>
          </div>
        </div>

        <div className="bg-brand-ivory/40 p-4 rounded-2xl border border-brand-gold/5 flex items-start gap-4">
           <div className="p-2 bg-white rounded-xl shadow-sm"><Clock className="w-4 h-4 text-brand-gold" /></div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 mb-1">Timestamp</p>
             <p className="text-sm font-bold text-brand-navy">{new Date(entry.created_at).toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* category breakdown */}
      <div className="mb-8 p-5 bg-brand-navy rounded-3xl text-white shadow-xl">
         <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Classification</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Entry</span>
         </div>
         <p className="text-xl font-headline font-bold mb-1 capitalize">{entry.reference_type?.replace('_', ' ') || 'General'}</p>
         <div className="h-[1px] bg-white/10 my-4" />
         <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 mt-1 opacity-40 shrink-0" />
            <p className="text-sm font-body opacity-80 leading-relaxed italic">
              {entry.notes || 'No audit notes provided for this institutional movement.'}
            </p>
         </div>
      </div>

      {/* running balance info if we had it from stats, otherwise just footer */}
      <footer className="flex flex-col items-center gap-4 pt-4">
        <div className="flex items-center gap-3 px-6 py-2.5 bg-brand-gold/5 rounded-full border border-brand-gold/10 opacity-60">
           <ShieldCheck className="w-4 h-4 text-brand-gold" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-navy">Immutable Cryptographic Audit</span>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-brand-ivory py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-navy hover:bg-brand-gold/5 transition-all"
        >
          Exit Audit View
        </button>
      </footer>
    </Modal>
  )
}

export default LedgerDetailModal
