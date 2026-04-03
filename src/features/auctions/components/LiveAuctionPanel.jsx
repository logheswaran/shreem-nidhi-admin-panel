import React, { useState, useEffect } from 'react'
import { Trophy, History, Gavel as GavelIcon, AlertTriangle } from 'lucide-react'
import DataTable from '../../../shared/components/ui/DataTable'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { supabase } from '../../../core/lib/supabase'

const LiveAuctionPanel = ({ round, chit, initialBids, loading, onExecute }) => {
  const [bids, setBids] = useState(initialBids || [])
  const [elapsedTime, setElapsedTime] = useState('')

  useEffect(() => {
    setBids(initialBids || [])
  }, [initialBids])

  // Live Subscription
  useEffect(() => {
    if (round.status !== 'open') return

    const channel = supabase
      .channel(`auction-${round.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_round_id=eq.${round.id}`
        },
        async (payload) => {
          // Fetch member details for the new bid
          const { data } = await supabase
            .from('chit_members')
            .select('*, profiles(*)')
            .eq('id', payload.new.chit_member_id)
            .single()

          const newBid = { ...payload.new, chit_members: data }
          setBids(prev => [newBid, ...prev].sort((a, b) => b.bid_amount - a.bid_amount))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [round.id, round.status])

  // Timer loop
  useEffect(() => {
    if (round.status !== 'open') return
    const openedAt = new Date(round.opened_at).getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = now - openedAt
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setElapsedTime(`${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [round.opened_at, round.status])

  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => Number(b.bid_amount))) : 0

  // Calculator Logic
  const pool = (chit?.total_members || 0) * (chit?.monthly_amount || 0)
  const isClosed = round.status === 'closed'
  
  // If closed, use actual values, else project based on highest bid
  const winningBid = isClosed ? Number(round.winning_bid_amount || 0) : highestBid
  const commission = isClosed ? Number(round.commission_amount || 0) : winningBid * ((chit?.commission_rate || 5) / 100)
  const distributable = winningBid - commission
  const prize = pool - winningBid
  const activeNonWinners = (chit?.total_members || 1) - 1
  const dividend = isClosed ? Number(round.dividend_amount || 0) : (activeNonWinners > 0 ? distributable / activeNonWinners : 0)

  const bidColumns = [
    { 
      header: 'Participant', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/5 flex items-center justify-center font-bold text-xs">
            {row.chit_members?.profiles?.full_name?.[0]}
          </div>
          <span className="font-bold text-brand-navy">{row.chit_members?.profiles?.full_name}</span>
          {row.chit_members?.has_won && (
            <span className="ml-2 inline-flex items-center gap-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
               <AlertTriangle className="w-3 h-3" /> Already won
            </span>
          )}
        </div>
      )
    },
    { header: 'Bid Amount', render: (row) => <span className="font-bold text-brand-gold">₹{Number(row.bid_amount).toLocaleString()}</span> },
    { header: 'Submitted At', render: (row) => <span className="text-xs opacity-40">{new Date(row.bid_at).toLocaleString()}</span> }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Bids & Audit */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-brand-ivory rounded-[2.5rem] border border-brand-gold/10 flex justify-between items-center shadow-inner">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-brand-gold/5 relative overflow-hidden">
                {round.status === 'open' && <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>}
                <History className={`text-brand-gold w-7 h-7 ${round.status === 'open' ? 'animate-pulse text-green-600' : ''}`} />
              </div>
              <div>
                <h5 className="font-headline font-bold text-2xl text-brand-navy">Cycle Month {round.month_number}</h5>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">
                   {round.status === 'open' ? `LIVE AUCTION • ELAPSED: ${elapsedTime}` : 'BIDDING WINDOW CLOSED'}
                </p>
              </div>
           </div>
           {round.status === 'open' ? (
             <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold shadow-sm ring-1 ring-green-600/20 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div> LIVE
             </div>
           ) : (
             <StatusBadge status={round.status} />
           )}
        </div>

        <div className="flex justify-between items-center px-2">
           <h6 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-text/30">Submitted Bids ({bids.length})</h6>
           {round.status === 'open' && (
             <div className="flex gap-3">
               <button 
                 onClick={() => onCancel()}
                 className="bg-red-50 text-red-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
               >
                 Cancel Auction
               </button>
               <button 
                 onClick={() => onExecute(bids.length)}
                 className="bg-brand-navy text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-navy-light transition-all flex items-center gap-2 shadow-md"
               >
                 <GavelIcon className="w-3.5 h-3.5 text-brand-gold" /> Execute Laureate Admission
               </button>
             </div>
           )}
        </div>
        <div className="bg-white rounded-3xl overflow-hidden border border-brand-gold/5">
           <DataTable columns={bidColumns} data={bids} loading={loading} />
        </div>
      </div>

      {/* RIGHT: Financial Calculator */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-brand-navy rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy className="w-24 h-24" /></div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 relative z-10">Financial Breakdown</h3>
           
           <div className="space-y-4 relative z-10 font-body">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-xs opacity-70">Chit Pool ({chit?.total_members} × ₹{chit?.monthly_amount?.toLocaleString()})</span>
                 <span className="font-bold">₹{pool.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-xs opacity-70 text-brand-gold">
                   {isClosed ? 'Winning Bid' : 'Highest Bid (Projected)'}
                 </span>
                 <span className="font-black text-brand-gold">₹{winningBid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-xs opacity-70">Commission ({chit?.commission_rate}%)</span>
                 <span className="font-bold">₹{commission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-xs opacity-70">Distributable Dividend</span>
                 <span className="font-bold">₹{distributable.toLocaleString()}</span>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-brand-gold/20 relative z-10">
              <div className="mb-4">
                 <p className="text-[9px] uppercase tracking-widest text-brand-gold opacity-80 mb-1">Prize to Laureate</p>
                 <p className="text-2xl font-headline font-bold">₹{prize.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-[9px] uppercase tracking-widest text-brand-gold opacity-80 mb-1">
                   Dividend Per Member ({activeNonWinners} non-winners)
                 </p>
                 <p className="text-xl font-headline font-bold text-green-400">₹{dividend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
           </div>
        </div>

        {round.status === 'open' && (
          <div className="bg-brand-ivory/50 rounded-2xl p-4 border border-brand-gold/10 text-xs text-brand-text/60 italic font-medium">
             * Assuming "Highest Bid Wins" policy according to institutional protocol. Values project mathematically pending final admin execution.
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveAuctionPanel
