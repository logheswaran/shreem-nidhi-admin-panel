import React, { useState } from 'react'
import { Rocket } from 'lucide-react'
import { usePayouts, useActiveChits } from '../finance/hooks'
import { PayoutTable, PayoutAlert, PayoutSettlementModal } from './components'

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

  const handleSettlementClick = (chit) => {
    setSelectedChit(chit)
    setIsModalOpen(true)
  }

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

      <PayoutAlert 
        chitsAwaitingMaturity={chitsAwaitingMaturity} 
        onHandleSettlement={handleSettlementClick} 
      />

      <PayoutTable payouts={payouts} loading={loading} />

      <PayoutSettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedChit={selectedChit}
        onProcessMaturity={handleProcessMaturity}
        isSettling={isSettling}
      />

      <footer className="mt-20 flex flex-col items-center gap-4 opacity-30">
        <div className="w-16 h-[1px] bg-brand-gold"></div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#2B2620]">Trusted Settlement Interface</p>
      </footer>
    </div>
  )
}

export default Payouts
