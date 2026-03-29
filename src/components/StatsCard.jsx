import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ title, value, icon: Icon, trend, trendType = 'up' }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-gold/10 transition-all hover:shadow-md flex items-center gap-4 group">
      <div className="p-4 bg-brand-ivory rounded-full shrink-0 group-hover:heritage-gradient transition-all duration-300">
        <Icon className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
      </div>
      <div>
        <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1 font-body">
          {title}
        </h3>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-headline font-bold text-brand-navy">
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
    </div>
  )
}

export default StatsCard
