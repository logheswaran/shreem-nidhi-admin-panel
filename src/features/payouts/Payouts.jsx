import React, { useState } from 'react'
import { Rocket, IndianRupee, CheckCircle2, AlertCircle, History, Landmark, ShieldCheck } from 'lucide-react'
import { usePayouts, useActiveChits } from '../finance/hooks'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'

const Payouts = () => {
  const { data: payouts = [], isLoading: loading, processMaturity, isSettling } = usePayouts()
  const { data: activeChits = [] } = useActiveChits()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChit, setSelectedChit] = useState(null)

  // Filter for chits that have reached their final month
  const chitsAwaitingMaturity = activeChits.filter(c => c.current_month === c.total_months)

  const handleProcessMaturity = async () => {
    try {
      await processMaturity(selectedChit.id)
      setIsModalOpen(false)
    } catch (error) {
      // toast handled in hook
    }
  }

  const columns = [
    { 
      header: 'Beneficiary', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center font-bold text-sm text-brand-gold border border-brand-gold/10 group-hover:bg-white transition-all shadow-sm">
            {row.chit_members?.profiles?.full_name?.[0] || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-[#2B2620] leading-none mb-1">{row.chit_members?.profiles?.full_name}</span>
            <span className="text-[10px] text-brand-text/30 font-bold tracking-widest uppercase">{row.chits?.name}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Settlement Yield', 
      render: (row) => (
        <div>
          <span className="font-bold text-[#2B2620] block leading-none mb-1">₹{Number(row.payout_amount).toLocaleString()}</span>
          <span className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest italic">Net matured value</span>
        </div>
      )
    },
    { 
      header: 'Audit Status', 
      render: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'Ref ID', 
      render: (row) => <span className="font-mono text-[10px] text-brand-text/30 font-bold uppercase tracking-tighter">MAT-{row.id.slice(0, 8).toUpperCase()}</span> 
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Maturity Settlements</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Execute final capital distribution for concluded trust cycles.</p>
        </div>
        {chitsAwaitingMaturity.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="heritage-gradient text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <Rocket className="w-5 h-5" />
            Process Final Maturity
          </button>
        )}
      </header>

      {/* Settlement Alert */}
      {chitsAwaitingMaturity.length > 0 && (
        <div className="mb-10 bg-brand-gold/5 border-l-4 border-brand-gold p-8 rounded-r-[3rem] shadow-sm flex flex-col md:flex-row gap-8 items-center animate-in slide-in-from-top-4 duration-700">
           <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-md shrink-0">
             <AlertCircle className="text-brand-gold w-8 h-8" />
           </div>
           <div className="flex-1">
             <h4 className="font-headline font-bold text-xl text-[#2B2620]">Concluded Cycles Detected</h4>
             <p className="text-sm text-brand-text/60 mt-1 leading-relaxed">There are <span className="font-bold text-[#2B2620]">{chitsAwaitingMaturity.length} scheme(s)</span> awaiting final maturity processing. This will auto-settle any remaining loans, calculate interest, and generate payout records.</p>
           </div>
           <button 
             onClick={() => { setSelectedChit(chitsAwaitingMaturity[0]); setIsModalOpen(true); }}
             className="px-8 py-3 bg-[#2B2620] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shrink-0"
           >
             Handle Settlement
           </button>
        </div>
      )}

      <DataTable columns={columns} data={payouts} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Institutional Settlement Authorization">
        {selectedChit && (
          <div className="space-y-10">
            <div className="p-10 bg-brand-ivory rounded-[3rem] border border-brand-gold/10 shadow-inner">
               <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 heritage-gradient rounded-3xl flex items-center justify-center text-white shadow-2xl"><Landmark className="w-8 h-8" /></div>
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
                 onClick={handleProcessMaturity}
                 className="w-full heritage-gradient text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-2"
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
                 onClick={() => setIsModalOpen(false)}
                 className="w-full py-4 text-brand-text/30 text-[9px] font-black uppercase tracking-[0.3em] hover:text-brand-gold transition-colors"
               >
                 Abort Settlement
               </button>
            </div>
          </div>
        )}
      </Modal>

      <footer className="mt-20 flex flex-col items-center gap-4 opacity-30">
        <div className="w-16 h-[1px] bg-brand-gold"></div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#2B2620]">Trusted Settlement Interface</p>
      </footer>
    </div>
  )
}

export default Payouts
