import React from 'react'

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-surface-container-high text-on-surface-variant',
    paid: 'bg-secondary-container/30 text-secondary',
    active: 'bg-primary-container/10 text-primary-container',
    completed: 'bg-brand-navy/10 text-brand-navy',
    won: 'bg-brand-gold/10 text-brand-gold',
    rejected: 'bg-red-100 text-red-600',
    verified: 'bg-green-100 text-green-600',
    approved: 'bg-secondary-container/30 text-secondary',
    open: 'bg-brand-gold/10 text-brand-gold',
    closed: 'bg-surface-container-highest text-on-surface-variant',
  }

  const label = status?.charAt(0).toUpperCase() + status?.slice(1)

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status?.toLowerCase()] || styles.pending}`}>
      {label || 'Unknown'}
    </span>
  )
}

export default StatusBadge
