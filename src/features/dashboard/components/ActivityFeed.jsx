import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CreditCard, UserPlus, Trophy, Gavel, ArrowRight, History, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ActivityFeed = ({ ledger = [] }) => {
  const navigate = useNavigate()

  const getIcon = (item) => {
    if (item.transaction_type === 'credit') return <CreditCard className="w-4 h-4 text-green-500" />
    if (item.reference_type?.toLowerCase().includes('auction')) return <Gavel className="w-4 h-4 text-brand-gold" />
    if (item.reference_type?.toLowerCase().includes('winner')) return <Trophy className="w-4 h-4 text-amber-500" />
    return <History className="w-4 h-4 text-brand-text/40" />
  }

  const getDescription = (item) => {
    const name = item.profiles?.full_name || 'Protocol User'
    const amount = Number(item.amount || 0).toLocaleString()
    const chitName = item.chits?.name || 'Chit'

    if (item.transaction_type === 'credit') return `Received ₹${amount} from ${name} for ${chitName}`
    if (item.reference_type === 'auction_dividend') return `Distributed ₹${amount} dividend for ${chitName}`
    if (item.reference_type === 'auction_winner') return `${name} won ${chitName} auction (₹${amount})`
    
    return `${item.reference_type}: ₹${amount} — ${name}`
  }

  if (!ledger || ledger.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gold/10 shadow-sm flex flex-col h-full bg-brand-ivory/20 min-h-[300px] items-center justify-center text-center">
         <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4">
           <History className="w-6 h-6 text-brand-gold" />
         </div>
         <h3 className="text-sm font-bold text-[#2B2620]">Activity Feed Empty</h3>
         <p className="text-[10px] text-brand-text/50 mt-1 mb-6 max-w-[200px]">Real-time ledger events and payment history will appear here once registered.</p>
         <button 
           onClick={() => navigate('/payments')}
           className="px-6 py-2.5 bg-[#2B2620] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
         >
           <PlusCircle className="w-3 h-3" /> Record First Payment
         </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gold/10 shadow-sm h-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-headline text-2xl font-bold text-[#2B2620] flex items-center gap-3">
             <History className="w-6 h-6 text-brand-gold" />
             Institutional Live Feed
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 mt-1">Real-time ledger transparency</p>
        </div>
        <button 
          onClick={() => navigate('/ledger')}
          className="p-2 bg-brand-ivory rounded-full hover:bg-brand-gold/10 text-brand-gold transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2 max-h-[500px]">
        {ledger.map((item, idx) => (
          <div key={idx} className="flex gap-4 group cursor-default">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-brand-ivory flex items-center justify-center shrink-0 border border-brand-gold/5 group-hover:bg-brand-gold/10 transition-colors">
                {getIcon(item)}
              </div>
              {idx !== ledger.length - 1 && <div className="w-0.5 h-full bg-brand-gold/10 mt-2"></div>}
            </div>
            
            <div className="pb-8">
              <p className="text-sm font-bold text-[#2B2620] group-hover:text-brand-gold transition-colors">{getDescription(item)}</p>
              <div className="flex items-center gap-3 mt-1.5 opacity-60">
                 <span className="text-[9px] font-black uppercase tracking-widest text-brand-text">
                   {formatDistanceToNow(new Date(item.created_at || Date.now()), { addSuffix: true })}
                 </span>
                 <span className="w-1 h-1 bg-brand-gold rounded-full"></span>
                 <span className="text-[9px] font-black uppercase tracking-widest text-brand-text">ID: {item.id.substring(0,6).toUpperCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate('/ledger')}
        className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60 hover:text-brand-gold transition-all flex items-center justify-center gap-2 mt-4"
      >
        View Full Ledger History <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  )
}

export default ActivityFeed
