import React from 'react'
import { Search, Filter, Calendar } from 'lucide-react'
import { useActiveChits } from '../../hooks'

const PaymentFilters = ({ filters, setFilters }) => {
  const { data: chits = [] } = useActiveChits()

  return (
    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border border-brand-gold/10 shadow-sm">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search member name or mobile..."
          className="w-full pl-10 pr-4 py-2.5 bg-brand-ivory border border-brand-gold/5 rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-gold/30 transition-all"
        />
      </div>

      {/* Chit Filter */}
      <div className="relative">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30" />
        <select
          value={filters.chitId}
          onChange={(e) => setFilters({ ...filters, chitId: e.target.value })}
          className="pl-10 pr-10 py-2.5 bg-brand-ivory border border-brand-gold/5 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-gold/30 appearance-none cursor-pointer"
        >
          <option value="">All Chit Groups</option>
          {chits.map((chit) => (
            <option key={chit.id} value={chit.id}>
              {chit.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex bg-brand-ivory p-1 rounded-2xl border border-brand-gold/5">
        {['all', 'pending', 'paid', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilters({ ...filters, status })}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
              filters.status === status
                ? 'bg-white text-brand-gold shadow-sm'
                : 'text-brand-text/40 hover:text-brand-gold/60'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30" />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="pl-10 pr-4 py-2.5 bg-brand-ivory border border-brand-gold/5 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-gold/30 cursor-pointer"
        />
      </div>
    </div>
  )
}

export default PaymentFilters
