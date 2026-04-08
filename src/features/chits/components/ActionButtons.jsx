import React, { useState } from 'react'
import { 
  Play, Trophy, Gavel, CheckCircle2, 
  Power, UserPlus, Milestone, ChevronRight 
} from 'lucide-react'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import { useChitActions } from '../hooks'

// --- Pill Component: Heritage Ivory Theme --- //
const ActionPill = ({ label, icon: Icon, onClick, color = 'gold', disabled = false, variant = 'ghost', isPending = false }) => {
  const base = "flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-sm border border-brand-gold/10 flex-1 whitespace-nowrap"
  
  const themes = {
    // Primary Gold Theme
    gold: variant === 'solid' ? 'bg-brand-gold text-white hover:brightness-110 shadow-gold' : 'bg-brand-gold/5 text-brand-gold hover:bg-brand-gold/10',
    // Secondary Ivory Theme
    ivory: variant === 'solid' ? 'bg-brand-ivory text-[#2B2620] hover:bg-brand-gold/10' : 'bg-brand-ivory text-[#2B2620]/60 hover:text-[#2B2620] hover:bg-brand-gold/5',
    // Danger/Warning
    danger: variant === 'solid' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red' : 'bg-red-50 text-red-600 hover:bg-red-100',
    warning: variant === 'solid' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber' : 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  }

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled || isPending}
      className={`${base} ${themes[color]} ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:translate-y-[-1px] active:scale-95'}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

const ActionButtons = ({ chit }) => {
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, title: '', message: '' })
  const { mutate, isPending } = useChitActions()

  const handleActionClick = (type) => {
    const nextMonth = (chit.current_month || 0) + 1
    
    switch (type) {
      case 'startMonth':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Initialize Next Cycle',
          message: `Are you sure you want to commence Cycle ${nextMonth} for ${chit.name}? This will generate contribution ledgers for all active beneficiaries.`
        })
        break
      case 'closeAuction':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Conclude Active Auction',
          message: `Are you sure you want to close the current bidding window for ${chit.name}? This will automatically compute and distribute dividends.`
        })
        break
      case 'maturity':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Process Group Maturity',
          message: `Are you sure you want to conclude the ${chit.name} lifecycle? This will process final settlements and archive the group.`
        })
        break
      case 'winner':
        setConfirmState({
          isOpen: true,
          type,
          title: 'Assign Random Winner',
          message: `Declare a randomized winner for Cycle ${chit.current_month}? This will allocate the prize and update the group state.`
        })
        break
      default:
        mutate({ actionType: type, payload: { chitId: chit.id, month: chit.current_month } })
    }
  }

  const handleConfirm = () => {
    mutate({ actionType: confirmState.type, payload: { chitId: chit.id, month: chit.current_month } })
    setConfirmState({ isOpen: false, type: null, title: '', message: '' })
  }

  // --- Logic Helpers --- //
  const isForming = chit.status === 'forming'
  const isCompleted = chit.status === 'completed'
  const isRandom = chit.chit_type === 'random'
  const isTraditional = chit.chit_type === 'traditional'

  // --- Lifecycle Views --- //
  if (isCompleted) {
    return (
      <div className="flex gap-3 mt-4 w-full">
        <div className="flex-1 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-emerald-100 shadow-sm">
          <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
          Group Concluded
        </div>
      </div>
    )
  }

  if (isForming) {
    return (
      <div className="flex gap-3 mt-4 w-full">
        <ActionPill 
          label="Admit Members" 
          icon={UserPlus} 
          onClick={() => window.location.href = '/members'} 
          color="gold"
          variant="solid"
        />
        <ActionPill 
          label="Start Cycle" 
          icon={Play} 
          onClick={() => handleActionClick('startMonth')} 
          disabled={chit.members_count < (chit.max_members || chit.members_limit)}
          color="ivory"
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-4 w-full">
        {/* Month Initiation */}
        <ActionPill 
          label="Start Cycle" 
          icon={Play} 
          onClick={() => handleActionClick('startMonth')}
          disabled={chit.current_month >= (chit.total_months || chit.duration_months)}
          color="ivory"
        />

        {/* Pricing/Winner Mechanics */}
        {isTraditional ? (
          <div className="flex items-center gap-3 flex-1">
            <ActionPill 
              label="Open Auction" 
              icon={Gavel} 
              color="gold"
              variant="solid"
              onClick={() => handleActionClick('openAuction')}
            />
            <ActionPill 
              label="End Auction" 
              icon={CheckCircle2} 
              color="ivory"
              onClick={() => handleActionClick('closeAuction')}
            />
          </div>
        ) : (
          <ActionPill 
            label="Run Random Pick" 
            icon={Trophy} 
            color="gold"
            variant="solid"
            onClick={() => handleActionClick('winner')}
          />
        )}

        {/* Global Maturity Safeguard */}
        {(chit.current_month >= (chit.total_months || chit.duration_months) - 1) && (
          <ActionPill 
            label="Mature" 
            icon={Power} 
            color="danger"
            variant="ghost"
            onClick={() => handleActionClick('maturity')}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirm"
        cancelText="Cancel"
        variant={confirmState.type === 'maturity' ? 'danger' : 'primary'}
        isLoading={isPending}
      />
    </>
  )
}

export default ActionButtons
