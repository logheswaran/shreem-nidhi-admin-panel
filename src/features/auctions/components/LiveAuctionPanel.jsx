import React, { useState, useEffect } from 'react'
import { Trophy, History, Gavel as GavelIcon, AlertTriangle } from 'lucide-react'
import DataTable from '../../../shared/components/ui/DataTable'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { supabase } from '../../../core/lib/supabase'
import { toast } from 'react-hot-toast'
import PremiumDropdown from '../../../shared/components/ui/PremiumDropdown'
import { auctionService } from '../api'

const LiveAuctionPanel = ({ round, chit, initialBids, loading, onExecute, onCancel }) => {
  const [bids, setBids] = useState(initialBids || [])
  const [elapsedTime, setElapsedTime] = useState('')
  const [manualBid, setManualBid] = useState({ memberId: '', amount: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          const { data } = await supabase
            .from('chit_members')
            .select('*, profiles(*)')
            .eq('id', payload.new.chit_member_id)
            .single()

          const newBid = { ...payload.new, chit_members: data }
          // SORT BY LOWEST BID (Master Rule: Lowest bid wins)
          setBids(prev => [newBid, ...prev].sort((a, b) => a.bid_amount - b.bid_amount))
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

  // Calculator Logic
  const pool = (chit?.total_members || 0) * (chit?.monthly_amount || 0)
  const lowestBid = bids.length > 0 ? Math.min(...bids.map(b => Number(b.bid_amount))) : pool
  const currentLeader = bids.length > 0 ? bids[0] : null
  const eligibleMembers = (chit?.chit_members || []).filter(m => !m.has_won)
  
  const isClosed = round.status === 'closed'
  const winningBid = isClosed ? Number(round.winning_bid_amount || 0) : lowestBid
  const prize = winningBid
  const distributable = pool - winningBid
  const activeNonWinners = (chit?.total_members || 1) - 1
  const dividend = isClosed ? Number(round.dividend_amount || 0) : (activeNonWinners > 0 ? distributable / activeNonWinners : 0)
  const commission = Math.max(0, pool - winningBid - distributable)

  const handleManualBid = async (e) => {
    e.preventDefault()
    if (!manualBid.memberId || !manualBid.amount) return
    
    const bidVal = Number(manualBid.amount)
    const currentMin = bids.length > 0 ? lowestBid : pool

    if (bidVal >= currentMin && bids.length > 0) {
      toast.error(`Bid Refused: Must be lower than institutional minimum (₹${currentMin.toLocaleString()})`)
      return
    }

    try {
      setIsSubmitting(true)
      await auctionService.placeBid(manualBid.memberId, round.id, bidVal)
      toast.success(`Entry accepted for ${eligibleMembers.find(m => m.id === manualBid.memberId)?.profiles?.full_name}`)
      setManualBid({ memberId: '', amount: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const bidColumns = [
    { 
      header: 'Participant', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/5 flex items-center justify-center font-bold text-xs shadow-inner">
            {row.chit_members?.profiles?.full_name?.[0]}
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-[#2B2620] leading-none mb-0.5">{row.chit_members?.profiles?.full_name}</span>
             <span className="text-[9px] font-black uppercase tracking-widest text-brand-text/30">ID: {row.chit_members?.id.slice(0,8)}</span>
          </div>
          {row === currentLeader && round.status === 'open' && (
            <span className="ml-2 inline-flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm animate-pulse">
               Current Leader
            </span>
          )}
        </div>
      )
    },
    { header: 'Quota Bid', render: (row) => <span className="font-black text-[#2B2620]">₹{Number(row.bid_amount).toLocaleString()}</span> },
    { header: 'Audit Date', render: (row) => <span className="text-[10px] font-bold text-brand-text/20 uppercase tracking-tighter">{new Date(row.bid_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</span> }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="p-8 bg-brand-ivory rounded-[3rem] border border-brand-gold/10 flex flex-col md:flex-row justify-between items-center shadow-inner gap-6">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-brand-gold/5 relative overflow-hidden">
                {round.status === 'open' && <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>}
                <div className="absolute -bottom-2 -right-2 opacity-5"><GavelIcon className="w-12 h-12 rotate-12" /></div>
                <History className={`text-brand-gold w-8 h-8 ${round.status === 'open' ? 'animate-pulse text-green-600' : ''}`} />
              </div>
              <div>
                <h5 className="font-headline font-bold text-3xl text-[#2B2620] leading-none mb-1">Cycle {round.month_number}</h5>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60">
                   {round.status === 'open' ? `SESSION ACTIVE • ${elapsedTime}` : 'TRANSCRIPT ARCHIVED'}
                </p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
             {round.status === 'open' && (
               <div className="bg-green-100 text-green-700 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-green-600/10 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div> Live Node
               </div>
             )}
             <StatusBadge status={round.status} />
           </div>
        </div>

        {round.status === 'open' && (
          <form onSubmit={handleManualBid} className="p-6 bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-xl flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 ml-2">Override: Delegate Admission</label>
                <PremiumDropdown 
                  className="bg-brand-ivory/50"
                  placeholder="Select Participant..."
                  value={manualBid.memberId}
                  onChange={(val) => setManualBid({ ...manualBid, memberId: val })}
                  options={eligibleMembers.map(m => ({
                    value: m.id,
                    label: m.profiles?.full_name
                  }))}
                />
             </div>
             <div className="w-full md:w-48 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 ml-2">Quota Bid (₹)</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  className="w-full bg-brand-ivory/50 border border-brand-gold/10 rounded-2xl p-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 shadow-inner"
                  value={manualBid.amount}
                  onChange={(e) => setManualBid({ ...manualBid, amount: e.target.value })}
                />
             </div>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="bg-[#2B2620] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg active:scale-95 disabled:opacity-50"
             >
               Commit Bid
             </button>
          </form>
        )}

        <div className="flex justify-between items-center px-4">
           <div className="flex items-center gap-3">
              <GavelIcon className="w-4 h-4 text-brand-gold" />
              <h6 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2B2620]">Competitive Pipeline ({bids.length})</h6>
           </div>
           {round.status === 'open' && (
             <div className="flex gap-4">
                <button 
                  onClick={() => onCancel()}
                  className="px-6 py-2.5 text-brand-text/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Force Stop
                </button>
                <button 
                  onClick={() => onExecute(bids.length)}
                  className="bg-[#2B2620] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
                >
                   Finalize Admission
                </button>
             </div>
           )}
        </div>
        <div className="bg-white rounded-[2rem] overflow-hidden border border-brand-gold/5 shadow-inner">
           <DataTable columns={bidColumns} data={bids} loading={loading} />
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#2B2620] rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl">
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
