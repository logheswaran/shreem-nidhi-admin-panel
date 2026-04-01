import React, { useState } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import { Play, Trophy, Gavel, CheckCircle2, Milestone } from 'lucide-react'

const ActionModal = ({ isOpen, onClose, mutateAction, isPending }) => {
  const [chitId, setChitId] = useState('')
  const [month, setMonth] = useState('')

  const handleAction = (type) => {
    if (!chitId) return alert('Please input Target Chit ID')
    
    if (type === 'openAuction' && !month) {
      return alert('Please input Round / Month number for new auction.')
    }

    if (type === 'closeAuction' && !month) { // Here using month field as auction ID for quick UX
      return alert('Please input Target Auction Round ID in the Round field.')
    }

    const payload = type === 'openAuction' 
      ? { chitId, month } 
      : type === 'closeAuction' 
        ? month // treating month field as auctionId input
        : chitId

    mutateAction({ type, payload })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Administrative Command Center">
      <div className="space-y-6">
        <div className="bg-brand-navy/5 p-4 rounded-[1.5rem] border border-brand-navy/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 mb-2 px-1">Target Identity</p>
          <input 
            className="w-full bg-white border border-brand-gold/20 rounded-[1rem] p-3 text-sm font-body mb-3 focus:ring-0 focus:border-brand-gold transition-colors"
            placeholder="Chit Protocol UUID"
            value={chitId}
            onChange={(e) => setChitId(e.target.value)}
          />
          <input 
            className="w-full bg-white border border-brand-gold/20 rounded-[1rem] p-3 text-sm font-body mb-3 focus:ring-0 focus:border-brand-gold transition-colors"
            placeholder="Month Number or Auction Round UUID"
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => handleAction('startMonth')}
             disabled={isPending}
             className="bg-white border border-brand-gold/20 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-brand-gold/5 transition-all text-brand-navy disabled:opacity-50"
           >
             <Play className="w-5 h-5 text-brand-gold" />
             <span className="text-[10px] font-black uppercase tracking-widest">Initialize Cycle</span>
           </button>

           <button 
             onClick={() => handleAction('winner')}
             disabled={isPending}
             className="bg-white border border-brand-gold/20 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-green-50 transition-all text-brand-navy disabled:opacity-50"
           >
             <Trophy className="w-5 h-5 text-green-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-center">Random Selection</span>
           </button>

           <button 
             onClick={() => handleAction('openAuction')}
             disabled={isPending}
             className="bg-white border border-brand-gold/20 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-brand-gold/5 transition-all text-brand-navy disabled:opacity-50"
           >
             <Gavel className="w-5 h-5 text-brand-gold" />
             <span className="text-[10px] font-black uppercase tracking-widest text-center">Open Auction</span>
           </button>

           <button 
             onClick={() => handleAction('closeAuction')}
             disabled={isPending}
             className="bg-white border border-brand-gold/20 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-red-50 transition-all text-brand-navy disabled:opacity-50"
           >
             <CheckCircle2 className="w-5 h-5 text-red-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-center">Close / Settle</span>
           </button>

           <button 
             onClick={() => handleAction('maturity')}
             disabled={isPending}
             className="col-span-2 bg-purple-50 border border-purple-200 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-purple-100 transition-all text-purple-900 disabled:opacity-50"
           >
             <Milestone className="w-5 h-5 text-purple-600" />
             <span className="text-[10px] font-black uppercase tracking-widest">Process Protocol Maturity</span>
           </button>
        </div>
      </div>
    </Modal>
  )
}

export default ActionModal
