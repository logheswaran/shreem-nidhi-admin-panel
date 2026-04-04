import React from 'react'
import { AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react'

const RiskBadge = ({ level = 'LOW', reason = '' }) => {
  const configs = {
    LOW: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: <ShieldCheck className="w-3 h-3" />,
      label: 'Low Risk'
    },
    MEDIUM: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'Medium Risk'
    },
    HIGH: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <AlertCircle className="w-3 h-3" />,
      label: 'High Risk'
    }
  }

  const current = configs[level] || configs.LOW
  const showTooltip = reason && level !== 'LOW'

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${current.bg} ${current.text} ${current.border} shadow-sm group relative ${level !== 'LOW' ? 'cursor-help' : 'cursor-default'}`}
    >
      {current.icon}
      <span className="text-[9px] font-black uppercase tracking-wider leading-none">
        {current.label}
      </span>
      
      {/* Tooltip implementation - Only show for elevated risk levels */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#2B2620] text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10 font-body">
          {reason}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#2B2620]"></div>
        </div>
      )}
    </div>
  )
}

export default RiskBadge
