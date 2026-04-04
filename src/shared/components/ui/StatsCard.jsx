import React from 'react'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const StatsCard = ({ title, value, icon: Icon, trend, trendType = 'up', onClick, urgency = 'normal' }) => {
  const isClickable = !!onClick;

  const urgencyStyles = {
    normal: 'border-brand-gold/10',
    warning: 'border-amber-400/50 bg-amber-50/5',
    danger: 'border-red-500/30 bg-red-50/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
  }

  return (
    <div 
      onClick={onClick}
      className={`relative bg-[var(--bg-card)] p-6 rounded-[2rem] shadow-sm border transition-all duration-200 ease-in-out flex items-center gap-4 group 
        ${isClickable ? 'cursor-pointer hover:scale-[1.01] hover:shadow-md' : ''} 
        ${urgencyStyles[urgency]} 
        hover:border-brand-gold/40 transition-colors duration-300`}
    >
      {/* Urgency Indicator Bar */}
      {urgency !== 'normal' && (
        <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full ${urgency === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
      )}

      {/* Icon Area */}
      <div className={`p-4 rounded-full shrink-0 transition-all duration-200 
        ${urgency === 'danger' ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-[rgba(186,117,23,0.1)] group-hover:bg-[rgba(186,117,23,0.2)]'}`}>
        <Icon 
          className={`w-6 h-6 transition-all duration-200 
            ${urgency === 'danger' ? 'text-red-500' : 'text-[#BA7517] opacity-60 group-hover:opacity-100'}`} 
        />
      </div>

      {/* Text Area */}
      <div className="flex-1">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 font-body opacity-60 
          ${urgency === 'danger' ? 'text-red-500/70' : 'text-[var(--text-secondary)]'}`}>
          {title}
        </h3>
        <div className="flex items-end gap-2">
          <p className={`text-2xl font-headline font-bold ${urgency === 'danger' ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
            {value}
          </p>
          {trend && (
            <span className={`text-[10px] font-bold flex items-center px-2 py-0.5 rounded-full mb-1 ${
              trendType === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
              {trendType === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trend}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Signal */}
      {isClickable && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className={`w-4 h-4 ${urgency === 'danger' ? 'text-red-500' : 'text-[#BA7517]'}`} />
        </div>
      )}
    </div>
  )
}

export default StatsCard
