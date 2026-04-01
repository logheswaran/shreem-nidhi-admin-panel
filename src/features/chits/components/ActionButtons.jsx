import React, { useState } from 'react'
import { Play, Trophy, Gavel, CheckCircle2, Milestone } from 'lucide-react'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import { useChitActions } from '../hooks'

const ActionButtons = ({ chit }) => {
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, title: '', message: '' })
  const { mutate, isPending } = useChitActions()

  const handleActionClick = (type) => {
    switch (type) {
      case 'startMonth':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Start New Month',
          message: `Are you sure you want to initialize Month ${chit.current_month + 1} for ${chit.name}? This will generate contribution ledgers for all active members.`
        })
        break
      case 'closeAuction':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Close Active Auction',
          message: `Are you sure you want to close the currently open auction for ${chit.name}? This will automatically distribute dividends to all non-winning members.`
        })
        break
      case 'maturity':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Process Chit Maturity',
          message: `Are you sure you want to conclude ${chit.name} and process final maturity operations? This action cannot be undone.`
        })
        break
      default:
        // No confirmation needed for openAuction or random selectWinner for better workflow flow, 
        // or we could add them. Let's just execute them immediately for speed, as requested by 'financial console'
        // Actually, open action needs month number, we pass current_month
        mutate({ actionType: type, payload: { chitId: chit.id, month: chit.current_month } })
    }
  }

  const handleConfirm = () => {
    mutate({ actionType: confirmState.type, payload: { chitId: chit.id, month: chit.current_month } })
    setConfirmState({ isOpen: false, type: null, title: '', message: '' })
  }

  // --- Logic Rules for Button Disablement ---
  const isForming = chit.status === 'forming'
  const isCompleted = chit.status === 'completed'
  const isRandom = chit.chit_type === 'random'
  const isTraditional = chit.chit_type === 'traditional'

  // An auction can be closed if traditional. For simplicity, we enable the button if traditional and not completed.
  // Real check might want to see if auction status is open, but API handles validation.

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-6 border-t border-brand-gold/10 pt-4">
        
        <button
          onClick={() => handleActionClick('startMonth')}
          disabled={isPending || isCompleted}
          className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-brand-navy/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/70 text-center">Start Month</span>
        </button>

        {isRandom && (
          <button
            onClick={() => handleActionClick('winner')}
            disabled={isPending || isForming || isCompleted}
            className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-green-50/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent group"
          >
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/70 text-center">Random Winner</span>
          </button>
        )}

        {isTraditional && (
          <>
            <button
              onClick={() => handleActionClick('openAuction')}
              disabled={isPending || isForming || isCompleted}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-orange-50/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent group"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Gavel className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/70 text-center">Open Auction</span>
            </button>
            <button
              onClick={() => handleActionClick('closeAuction')}
              disabled={isPending || isForming || isCompleted}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-red-50/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent group"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/70 text-center">Close Auction</span>
            </button>
          </>
        )}

        <button
          onClick={() => handleActionClick('maturity')}
          disabled={isPending || isForming || isCompleted}
          className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-purple-50/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent group lg:col-start-5"
        >
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Milestone className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/70 text-center">Process Maturity</span>
        </button>

      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
        confirmText="Execute"
        cancelText="Abort"
        variant="danger"
        isLoading={isPending}
      />
    </>
  )
}

export default ActionButtons
