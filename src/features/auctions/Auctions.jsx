import React, { useState } from 'react'
import { Gavel, Search, Plus, Calendar, Users, Trophy, ChevronRight, Gavel as GavelIcon, Info, CheckCircle2, History } from 'lucide-react'
import { useAuctionRounds, useBids, useAuctionActions } from './hooks'
import { useChits } from '../chits/hooks'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'

const Auctions = () => {
  const { data: allChits = [] } = useChits()
  const auctionChits = allChits.filter(c => c.chit_type === 'auction')
  
  const [activeChitId, setActiveChitId] = useState(auctionChits[0]?.id || null)
  const { data: rounds = [], isLoading: loading } = useAuctionRounds(activeChitId)
  
  const [selectedRoundId, setSelectedRoundId] = useState(null)
  const { data: bids = [], isLoading: bidsLoading } = useBids(selectedRoundId)
  
  const { closeAuction, isProcessing } = useAuctionActions()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState({ isOpen: false, round: null })

  const handleAuditBids = (round) => {
    setSelectedRoundId(round.id)
    setIsModalOpen(true)
  }

  const handleCloseAuction = async () => {
    if (!confirmClose.round) return
    try {
      await closeAuction(confirmClose.round.id)
      setConfirmClose({ isOpen: false, round: null })
      setIsModalOpen(false)
    } catch (error) {
      // toast handled in hook
    }
  }

  const columns = [
    { 
      header: 'Auction Round', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-gold/5 flex items-center justify-center text-brand-gold">
            <GavelIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-headline font-bold text-brand-navy capitalize">Cycle Month {row.month_number}</p>
            <p className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">Opened: {new Date(row.opened_at).toLocaleDateString()}</p>
          </div>
        </div>
      )
    },
    { header: 'Bidding Status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Winning Bid', 
      render: (row) => row.status === 'closed' ? <span className="font-bold text-green-600">₹{Number(row.winning_bid_amount).toLocaleString()}</span> : <span className="italic text-brand-text/30">In Progress</span> 
    },
    { 
      header: 'Action', 
      render: (row) => (
        <button 
          onClick={() => handleAuditBids(row)}
          className="bg-brand-gold/10 text-brand-goldDark text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-95"
        >
          Audit Bids
        </button>
      )
    }
  ]

  const bidColumns = [
    { 
      header: 'Participant', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/5 flex items-center justify-center font-bold text-xs">
            {row.chit_members?.profiles?.full_name?.[0]}
          </div>
          <span className="font-bold text-brand-navy">{row.chit_members?.profiles?.full_name}</span>
        </div>
      )
    },
    { header: 'Bid Amount', render: (row) => <span className="font-bold text-brand-gold">₹{Number(row.bid_amount).toLocaleString()}</span> },
    { header: 'Submitted At', render: (row) => <span className="text-xs opacity-40">{new Date(row.bid_at).toLocaleString()}</span> }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Auction Orchestration</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Execute competitive bidding and dividend distribution for Traditional schemes.</p>
        </div>
        <div className="flex gap-4">
           {auctionChits.length > 0 && (
             <button className="heritage-gradient text-white px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
               <Plus className="w-4 h-4" /> Open New Window
             </button>
           )}
        </div>
      </header>

      {/* Scheme Selector Tab */}
      <div className="flex gap-12 border-b-2 border-brand-gold/5 mb-10 px-4 overflow-x-auto no-scrollbar">
         {auctionChits.map(c => (
           <button 
            key={c.id} 
            onClick={() => setActiveChitId(c.id)}
            className={`pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeChitId === c.id ? 'text-brand-navy' : 'text-brand-text/30 hover:text-brand-gold'}`}
           >
             {c.name}
             {activeChitId === c.id && <div className="absolute bottom-[-2px] left-0 w-full h-1 heritage-gradient rounded-full shadow-lg shadow-brand-gold/30"></div>}
           </button>
         ))}
      </div>

      <DataTable columns={columns} data={rounds} loading={loading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Sealed Bid Audit"
        maxWidth="max-w-4xl"
      >
        {selectedRoundId && (
          <div className="space-y-10">
            {rounds.find(r => r.id === selectedRoundId) && (
              <>
                <div className="p-8 bg-brand-ivory rounded-[2.5rem] border border-brand-gold/10 flex justify-between items-center shadow-inner">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-brand-gold/5">
                        <History className="text-brand-gold w-7 h-7" />
                      </div>
                      <div>
                        <h5 className="font-headline font-bold text-2xl text-brand-navy">Cycle Month {rounds.find(r => r.id === selectedRoundId).month_number}</h5>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">Bidding Window Audit</p>
                      </div>
                   </div>
                   <StatusBadge status={rounds.find(r => r.id === selectedRoundId).status} />
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                     <h6 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-text/30">Submitted Participation ({bids.length})</h6>
                     {rounds.find(r => r.id === selectedRoundId).status === 'open' && (
                       <button 
                         onClick={() => setConfirmClose({ isOpen: true, round: rounds.find(r => r.id === selectedRoundId) })}
                         className="bg-brand-navy text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-navy-light transition-all flex items-center gap-2 shadow-md"
                       >
                         <GavelIcon className="w-3.5 h-3.5 text-brand-gold" /> Execute laureate Admission
                       </button>
                     )}
                   </div>
                   <DataTable columns={bidColumns} data={bids} loading={bidsLoading} />
                </div>

                {rounds.find(r => r.id === selectedRoundId).status === 'closed' && (
                  <div className="bg-brand-navy/5 p-10 rounded-[3rem] border border-brand-navy/5 flex flex-col gap-6 items-center text-center">
                     <div className="w-20 h-20 heritage-gradient rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white mb-2">
                       <Trophy className="w-10 h-10" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-2">Cycle Laureate</p>
                       <h4 className="text-4xl font-headline font-bold text-brand-navy tracking-tight">₹{Number(rounds.find(r => r.id === selectedRoundId).winning_bid_amount).toLocaleString()} Acceptance</h4>
                       <p className="text-xs text-brand-text/40 mt-4 leading-relaxed max-w-lg mx-auto italic font-body">
                         This round was finalized on {new Date(rounds.find(r => r.id === selectedRoundId).closed_at).toLocaleString()}. 
                         Commission was deducted and a dividend of <span className="text-brand-gold font-bold">₹{Number(rounds.find(r => r.id === selectedRoundId).dividend_amount).toLocaleString()}</span> was distributed to all non-laureate participants.
                       </p>
                     </div>
                     <div className="flex gap-4 mt-4 w-full justify-center">
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-brand-gold/5">
                          <p className="text-[8px] font-bold text-brand-text/40 uppercase">Commission</p>
                          <p className="text-sm font-bold text-brand-navy">₹{Number(rounds.find(r => r.id === selectedRoundId).commission_amount).toLocaleString()}</p>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-brand-gold/5">
                          <p className="text-[8px] font-bold text-brand-text/40 uppercase">Net Dividend</p>
                          <p className="text-sm font-bold text-brand-navy">₹{Number(rounds.find(r => r.id === selectedRoundId).dividend_amount).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={confirmClose.isOpen}
        onClose={() => setConfirmClose({ isOpen: false, round: null })}
        onConfirm={handleCloseAuction}
        title="Execute Laureate Admission"
        message="This action is irreversible. The highest bidder will be awarded the prize and dividends will be credited to all active members in the institutional ledger."
        intent="brand"
        confirmText="Execute"
        loading={isProcessing}
      />
    </div>
  )
}

export default Auctions
