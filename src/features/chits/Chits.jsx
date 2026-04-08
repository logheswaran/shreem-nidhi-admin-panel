import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, ArrowUpDown, TrendingUp, Users, Wallet, ShieldCheck, AlertCircle, Database, ArrowRight } from 'lucide-react'
import { useChits } from './hooks'
import ChitCard from './components/ChitCard'
import CreateChitModal from './components/CreateChitModal'
import ChitQuickView from './components/ChitQuickView'
import PremiumDropdown from '../../shared/components/ui/PremiumDropdown'

const Chits = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChit, setSelectedChit] = useState(null)
  const [editingChit, setEditingChit] = useState(null)
  
  const { data: chits = [], isLoading, isError } = useChits(filterStatus, searchQuery)

  // --- KPI Computation: Registry Standards --- //
  const kpis = useMemo(() => {
    const totalValue = chits.reduce((acc, c) => acc + (Number(c.monthly_contribution || 0) * Number(c.max_members || 0)), 0)
    const activeCount = chits.filter(c => c.status === 'active').length
    const forming = chits.filter(c => c.status === 'forming').length
    return { total: chits.length, active: activeCount, forming, totalValue }
  }, [chits])

  const riskyChits = useMemo(() => 
    chits.filter(c => c.default_count > 0 || c.health_status === 'CRITICAL'),
    [chits]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 🚀 Header: Branded Chit Groups */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Chit Groups</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Operational registry for administrative group management.</p>
        </div>
        <button 
          onClick={() => { setEditingChit(null); setIsModalOpen(true) }}
          className="heritage-gradient px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 shadow-xl hover:brightness-110 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Launch New Group
        </button>
      </header>

      {/* 📊 KPI Summary Cards: Dashboard Parity Pass */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Total Chits */}
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
           <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold shrink-0">
              <Database className="w-6 h-6" />
           </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Total Chits</p>
               <p className="text-2xl font-headline font-bold text-[#2B2620]">{kpis.total}</p>
            </div>
        </div>

        {/* Active Members/Assets */}
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md flex items-center gap-4 border-b-4 border-b-green-500/30">
           <div className="p-4 rounded-full bg-green-500/10 text-green-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
           </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Active Assets</p>
               <p className="text-2xl font-headline font-bold text-[#2B2620]">{kpis.active}</p>
            </div>
        </div>

        {/* Forming Phase */}
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md flex items-center gap-4 border-b-4 border-b-brand-gold/30">
           <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold shrink-0">
              <Users className="w-6 h-6" />
           </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Forming Phase</p>
               <p className="text-2xl font-headline font-bold text-[#2B2620]">{kpis.forming}</p>
            </div>
        </div>

        {/* Total Value (Gold Inversion) */}
        <div className="heritage-gradient p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-4">
           <div className="p-4 rounded-full bg-white/10 text-white shrink-0">
              <Wallet className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Total Value</p>
              <p className="text-2xl font-headline font-bold">₹{kpis.totalValue.toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* 🔍 Search & Filters: Standardized Density */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
          <input 
            className="w-full bg-white/50 backdrop-blur-sm border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-body focus:ring-0 focus:outline-none transition-all placeholder:text-brand-text/20 shadow-sm"
            placeholder="Search Group Intelligence (Name, UUID)..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
           <PremiumDropdown 
             className="min-w-[160px]"
             value={filterStatus}
             onChange={(val) => setFilterStatus(val)}
             options={[
               { value: 'all', label: 'Any Status' },
               { value: 'forming', label: 'Forming' },
               { value: 'active', label: 'Active' },
               { value: 'completed', label: 'Completed' }
             ]}
           />

           <PremiumDropdown 
             className="min-w-[160px]"
             placeholder="Newest First"
             onChange={(val) => {}}
             options={[
               { value: 'newest', label: 'Newest First' },
               { value: 'value', label: 'Highest Value' },
               { value: 'name', label: 'Alphabetical' }
             ]}
           />
        </div>
      </div>

      {/* 📦 Content Grid: Optimized Proportions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-500">
        {chits.map(chit => (
          <ChitCard 
            key={chit.id} 
            chit={chit} 
            onQuickView={(c) => setSelectedChit(c)}
            onEdit={(c) => { setEditingChit(c); setIsModalOpen(true) }}
          />
        ))}

        {!isLoading && !isError && chits.length === 0 && (
          <div className="col-span-full py-20 bg-brand-ivory/50 rounded-[2rem] border-2 border-dashed border-brand-gold/20 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-brand-gold/30 mb-4" />
            <p className="text-[#2B2620] font-bold text-lg">No Groups Found</p>
            <p className="text-brand-text/50 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Adjust filters or launch a new administrative cycle</p>
          </div>
        )}
      </div>

      {/* 🔮 Overlays: Registry Standards */}
      <CreateChitModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingChit(null) }} initialData={editingChit} />
      <ChitQuickView isOpen={!!selectedChit} onClose={() => setSelectedChit(null)} chit={selectedChit} />
    </div>
  )
}

export default Chits
