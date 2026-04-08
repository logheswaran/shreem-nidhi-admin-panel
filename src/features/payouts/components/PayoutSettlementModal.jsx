import React from 'react'
import { Landmark, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'

const PayoutSettlementModal = ({ 
  isOpen, 
  onClose, 
  selectedChit, 
  onProcessMaturity, 
  isSettling 
}) => {
  if (!selectedChit) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Institutional Settlement Authorization">
      <div className="space-y-10">
        <div className="p-10 bg-brand-ivory rounded-[3rem] border border-brand-gold/10 shadow-inner">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 heritage-gradient rounded-3xl flex items-center justify-center text-white shadow-2xl">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <h5 className="font-headline font-bold text-2xl text-[#2B2620] tracking-tight">{selectedChit.name}</h5>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60">Final Settlement Window</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-brand-gold/5 shadow-sm">
              <p className="text-[9px] font-black text-brand-gold/40 uppercase tracking-[0.2em] mb-2 leading-none">Status</p>
              <p className="text-xs font-bold text-[#2B2620]">Month {selectedChit.current_month} of {selectedChit.total_months} (Concluded)</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-brand-gold/5 shadow-sm">
              <p className="text-[9px] font-black text-brand-gold/40 uppercase tracking-[0.2em] mb-2 leading-none">Participants</p>
              <p className="text-xs font-bold text-[#2B2620]">{selectedChit.max_members} Beneficiaries</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 flex gap-6 items-start">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
              <ShieldCheck className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 leading-none">Settlement Protocol</p>
              <p className="text-xs text-blue-800 leading-relaxed italic">
                This operation will calculate final dividends, auto-repay outstanding loans from maturity amounts, update individual ledgers, and mark the scheme as <span className="font-bold underline">Institutional Concluded</span>. 
                This action is irreversible.
              </p>
            </div>
          </div>

          <button 
            disabled={isSettling}
            onClick={onProcessMaturity}
            className="w-full heritage-gradient text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-2 disabled:opacity-50"
          >
            {isSettling ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Execute Final Maturation
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
          
          <button 
            onClick={onClose}
            disabled={isSettling}
            className="w-full py-4 text-brand-text/30 text-[9px] font-black uppercase tracking-[0.3em] hover:text-brand-gold transition-colors disabled:opacity-50"
          >
            Abort Settlement
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PayoutSettlementModal
