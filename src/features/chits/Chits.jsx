import React, { useState } from 'react'
import { Plus, Search, FilterX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useChits } from './hooks'
import ChitCard from './components/ChitCard'

// Skeleton Loader Custom to Chits Layout
const ChitsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-[2rem] border border-brand-gold/10 p-6 md:p-8 animate-pulse shadow-sm h-72">
          <div className="w-2/3 h-6 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-2 mb-6">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="w-full h-16 bg-gray-200 rounded-2xl"></div>
            <div className="w-full h-16 bg-gray-200 rounded-2xl"></div>
            <div className="w-full h-16 bg-gray-200 rounded-2xl col-span-2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

const Chits = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: chits, isLoading, isError } = useChits(filterStatus, searchQuery)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Chits Management</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">
            Control center for all active, forming, and completed chit operations.
          </p>
        </div>
        
        <Link 
          to="/chits/new" // Keeping route open, assuming this was there or can be created later
          className="heritage-gradient text-white px-8 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Create Chit Protocol
        </Link>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-brand-gold/10 shadow-sm flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/50" />
          <input 
            type="text"
            placeholder="Search by Chit UUID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-ivory pl-11 pr-4 py-3 rounded-xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-sm font-body transition-all"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-brand-ivory rounded-xl border border-brand-gold/20 w-full md:w-auto overflow-x-auto no-scrollbar">
          {['all', 'forming', 'active', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filterStatus === status 
                  ? 'bg-brand-navy text-white shadow-md' 
                  : 'text-brand-text/50 hover:bg-brand-navy/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {(filterStatus !== 'all' || searchQuery !== '') && (
          <button 
            onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-navy/50 hover:text-red-500 transition-colors px-4 py-3 shrink-0"
          >
            <FilterX className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Body Area */}
      {isError && (
        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center justify-center min-h-64">
           <p className="font-bold text-red-700">Failed to sync with operations database. Connection may be interrupted.</p>
        </div>
      )}

      {isLoading && <ChitsSkeleton />}

      {!isLoading && !isError && chits?.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-brand-gold/10 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-brand-navy/5 rounded-full flex items-center justify-center mb-6">
            <FilterX className="w-10 h-10 text-brand-navy/30" />
          </div>
          <h3 className="font-headline text-2xl font-bold text-brand-navy mb-2">No operations found.</h3>
          <p className="text-brand-text/60 font-body mb-8 max-w-sm">
            Try adjusting your search filters or status toggles to locate the chit you are looking for.
          </p>
          <button 
            onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}
            className="text-[10px] font-black uppercase tracking-widest bg-brand-navy text-white px-8 py-3 rounded-xl hover:bg-brand-navy/90"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {!isLoading && !isError && chits?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chits.map(chit => (
            <ChitCard key={chit.id} chit={chit} />
          ))}
        </div>
      )}

    </div>
  )
}

export default Chits
