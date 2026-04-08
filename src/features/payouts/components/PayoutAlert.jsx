import React from 'react'
import { AlertCircle } from 'lucide-react'

const PayoutAlert = ({ chitsAwaitingMaturity = [], onHandleSettlement }) => {
  if (chitsAwaitingMaturity.length === 0) return null

  return (
    <div className="mb-10 bg-brand-gold/5 border-l-4 border-brand-gold p-8 rounded-r-[3rem] shadow-sm flex flex-col md:flex-row gap-8 items-center animate-in slide-in-from-top-4 duration-700">
      <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-md shrink-0">
        <AlertCircle className="text-brand-gold w-8 h-8" />
      </div>
      <div className="flex-1">
        <h4 className="font-headline font-bold text-xl text-[#2B2620]">Concluded Cycles Detected</h4>
        <p className="text-sm text-brand-text/60 mt-1 leading-relaxed">
          There are <span className="font-bold text-[#2B2620]">{chitsAwaitingMaturity.length} scheme(s)</span> awaiting final maturity processing. 
          This will auto-settle any remaining loans, calculate interest, and generate payout records.
        </p>
      </div>
      <button 
        onClick={() => onHandleSettlement(chitsAwaitingMaturity[0])}
        className="px-8 py-3 bg-[#2B2620] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shrink-0"
      >
        Handle Settlement
      </button>
    </div>
  )
}

export default PayoutAlert
