import React, { useState } from 'react'
import { Gavel, Search, Plus, Calendar, Users, Trophy, ChevronRight, Gavel as GavelIcon, Info, CheckCircle2, History } from 'lucide-react'
import { useAuctionRounds, useBids, useAuctionActions } from './hooks'
import { useChits } from '../chits/hooks'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'
import LiveAuctionPanel from './components/LiveAuctionPanel'
import toast from 'react-hot-toast'
import { supabase } from '../../core/lib/supabase'

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
  const [confirmCancel, setConfirmCancel] = useState({ isOpen: false, round: null })
  const [noBidsWarning, setNoBidsWarning] = useState({ isOpen: false, round: null })

  const handleAuditBids = (round) => {
    setSelectedRoundId(round.id)
    setIsModalOpen(true)
  }

  const handleCloseAuction = async () => {
    if (!confirmClose.round) return
    try {
      await closeAuction(confirmClose.round.id)
      setConfirmClose({ isOpen: false, round: null })
      setNoBidsWarning({ isOpen: false, round: null })
      setIsModalOpen(false)
    } catch (error) {
      // toast handled in hook
    }
  }

  const handleCancelAuction = async () => {
    if (!confirmCancel.round) return
    try {
      toast.loading('Cancelling auction...', { id: 'cancel' })
      const { error } = await supabase.rpc('admin_cancel_auction', { p_auction_id: confirmCancel.round.id })
      if (error) throw error
      toast.success('Auction Cancelled!', { id: 'cancel' })
      setConfirmCancel({ isOpen: false, round: null })
      setIsModalOpen(false)
      // Ideally trigger a refetch here
    } catch (error) {
       toast.error(error.message || 'Failed to cancel', { id: 'cancel' })
    }
  }

  const handleExecuteRequest = (numBids) => {
    const roundToClose = rounds.find(r => r.id === selectedRoundId)
    if (numBids === 0) {
      setNoBidsWarning({ isOpen: true, round: roundToClose })
    } else {
      setConfirmClose({ isOpen: true, round: roundToClose })
    }
  }

  const activeChit = auctionChits.find(c => c.id === activeChitId)
  const hasOpenAuction = rounds.some(r => r.status === 'open')

  const handleOpenAuction = () => {
    if (hasOpenAuction) {
      toast.error('Sequence Lock: Close the current open auction before starting a new one.')
      return
    }
    // Launch logic here or open a form...
    toast.error('Launch form not connected yet')
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
             <button 
               onClick={handleOpenAuction}
               className={`heritage-gradient text-white px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 ${hasOpenAuction ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
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
        {selectedRoundId && activeChit && (
          <LiveAuctionPanel 
            round={rounds.find(r => r.id === selectedRoundId)} 
            chit={activeChit} 
            initialBids={bids} 
            loading={bidsLoading} 
            onExecute={handleExecuteRequest}
            onCancel={() => setConfirmCancel({ isOpen: true, round: rounds.find(r => r.id === selectedRoundId) })}
          />
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

      <ConfirmDialog 
        isOpen={noBidsWarning.isOpen}
        onClose={() => setNoBidsWarning({ isOpen: false, round: null })}
        onConfirm={() => {
           // We would call select_random_winner RPC here if it existed.
           // For traditional, Admin will run this manually or wait.
           toast.error('No random winner selected: Action must be handled manually.')
           setNoBidsWarning({ isOpen: false, round: null })
        }}
        title="⚠ No Bids Received"
        message="No bids have been placed for this cycle. You can either wait for bids or select a winner manually using the Random Draw."
        intent="danger"
        confirmText="Select random winner instead"
        loading={isProcessing}
      />

      <ConfirmDialog 
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, round: null })}
        onConfirm={handleCancelAuction}
        title="Admin Override: Cancel Auction"
        message="DANGER: This will instantly close the auction without selecting a winner or distributing dividends. This action is irreversible and should only be used in emergencies."
        intent="danger"
        confirmText="Force Cancel"
      />
    </div>
  )
}


export default Auctions
