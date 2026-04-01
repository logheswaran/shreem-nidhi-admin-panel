import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Users, Clock, Hash } from 'lucide-react'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import ActionButtons from './ActionButtons'

const ChitCard = ({ chit }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-brand-gold/10 p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-headline font-bold text-brand-navy">
            <Link to={`/chits/${chit.id}`} className="hover:text-brand-gold transition-colors">
              {chit.name}
            </Link>
          </h3>
          <div className="flex gap-2 items-center flex-wrap mt-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
              chit.chit_type === 'traditional' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {chit.chit_type}
            </span>
            <StatusBadge status={chit.status} />
          </div>
        </div>
        
        <Link 
          to={`/chits/${chit.id}`}
          className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all shrink-0"
        >
          <ArrowUpRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="bg-brand-ivory p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-brand-text/50 mb-1">
            <Hash className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Amount</span>
          </div>
          <p className="font-headline font-bold text-lg text-brand-navy">
            ₹{Number(chit.chit_value).toLocaleString()}
          </p>
        </div>

        <div className="bg-brand-ivory p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-brand-text/50 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Members</span>
          </div>
          <p className="font-headline font-bold text-lg text-brand-navy">
            {chit.members_count} / {chit.members_limit}
          </p>
        </div>

        <div className="bg-brand-ivory p-3 rounded-2xl col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-text/50 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
              Month {chit.current_month} of {chit.duration_months}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-brand-gold/10 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-brand-gold h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (chit.current_month / chit.duration_months) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Workflow Controls */}
      <ActionButtons chit={chit} />
      
    </div>
  )
}

export default ChitCard
