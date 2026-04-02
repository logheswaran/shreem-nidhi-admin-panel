import React from 'react'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const StatsCard = ({ title, value, icon: Icon, trend, trendType = 'up', onClick }) => {
  const isClickable = !!onClick;

  return (
    <div 
      onClick={onClick}
      className={`relative bg-[var(--bg-card)] p-6 rounded-[2rem] shadow-sm border border-brand-gold/10 transition-all duration-200 ease-in-out flex items-center gap-4 group 
        ${isClickable ? 'cursor-pointer' : ''} 
        hover:border-brand-gold/40 hover:scale-[1.01] hover:shadow-md transition-colors duration-300`}
    >
      {/* Icon Area */}
      <div className="p-4 bg-[rgba(186,117,23,0.1)] rounded-full shrink-0 group-hover:bg-[rgba(186,117,23,0.2)] transition-all duration-200">
        <Icon 
          className="w-6 h-6 text-[#BA7517] opacity-60 group-hover:opacity-100 transition-all duration-200" 
        />
      </div>

      {/* Text Area */}
      <div className="flex-1">
        <h3 className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mb-1 font-body opacity-60">
          {title}
        </h3>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-headline font-bold text-[var(--text-primary)]">
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

      {/* Navigation Signal (Prompt 3) */}
      {isClickable && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-4 h-4 text-[#BA7517]" />
        </div>
      )}
    </div>
  )
}

export default StatsCard
