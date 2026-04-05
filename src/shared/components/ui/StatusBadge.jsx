import React from 'react'

const StatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    // Basic States: Refactored to Heritage Ivory
    pending: 'bg-brand-ivory text-[#2B2620]/60 border-brand-gold/10',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-50',
    completed: 'bg-brand-gold text-white border-brand-gold shadow-gold',
    
    // Lifecycle States
    forming: 'bg-brand-ivory text-brand-gold border-brand-gold/20',
    winner: 'bg-brand-gold text-white shadow-gold border-brand-gold',
    participant: 'bg-brand-ivory text-[#2B2620]/70 border-brand-gold/10',
    
    // Results
    won: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    verified: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    
    // Financial Health
    at_risk: 'bg-amber-50 text-amber-600 border-amber-100',
    critical: 'bg-red-50 text-red-600 border-red-100',
    
    // Auction
    open: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
    closed: 'bg-brand-ivory text-[#2B2620]/40 border-brand-gold/10',
  }

  const normalizedStatus = status?.toLowerCase() || 'unknown'
  const displayLabel = status?.replace(/_/g, ' ') || 'Unknown'
  const sizeStyles = size === 'sm' ? 'px-2 py-1 text-[7px]' : 'px-4 py-2 text-[9px]'

  return (
    <span className={`${sizeStyles} rounded-full font-black uppercase tracking-[0.25em] transition-all duration-500 whitespace-nowrap shadow-sm border ${styles[normalizedStatus] || 'bg-brand-ivory text-[#2B2620]/40 border-brand-gold/10'}`}>
      {displayLabel}
    </span>
  )
}

export default StatusBadge
