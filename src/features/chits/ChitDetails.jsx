import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Users, Calendar, Coins, 
  TrendingUp, Landmark, ShieldCheck, 
  History, Gavel, ArrowUpRight, Plus,
  FileText, UserPlus, Info
} from 'lucide-react'
import { useChitDetails } from './hooks'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import ActionButtons from './components/ActionButtons'

const ChitDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('members')

  const { data: chit, isLoading, isError } = useChitDetails(id)

  const financials = useMemo(() => {
    if (!chit) return { collected: 0, pending: 0, defaults: 0 }
    return {
      collected: chit.contributions?.reduce((acc, c) => acc + (c.status === 'paid' ? Number(c.amount) : 0), 0) || 0,
      pending: chit.contributions?.reduce((acc, c) => acc + (c.status === 'pending' ? Number(c.amount) : 0), 0) || 0,
      defaults: chit.contributions?.filter(c => c.status === 'pending').length || 0
    }
  }, [chit])

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-[#2B2620] font-headline font-bold text-xl animate-pulse">Syncing Administrative Ledger...</p>
      <p className="text-brand-text/30 text-xs font-black uppercase tracking-widest mt-2 font-body">Consulting Secure Registry</p>
    </div>
  )

  if (isError || !chit) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <Info className="w-10 h-10 text-red-600" />
      </div>
      <h2 className="text-3xl font-headline font-bold text-[#2B2620] mb-4">Protocol Sync Failed</h2>
      <p className="text-brand-text/50 max-w-sm mb-8 leading-relaxed">The requested chit protocol could not be located or access was denied. Please verify the UUID and try again.</p>
      <button onClick={() => navigate('/chits')} className="heritage-gradient text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Return to Registry</button>
    </div>
  )

  const monthly = Number(chit.monthly_contribution || 0)
  const max = Number(chit.max_members || chit.members_limit || 0)
  const totalValue = monthly * max
  const currentMonth = Number(chit.current_month || 0)
  const duration = Number(chit.total_months || chit.duration_months || 0)

  // --- Column Definitions --- //
  const memberColumns = [
    { 
      header: 'Beneficiary', 
      render: (row) => (
        <div className="flex items-center gap-4 py-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 flex items-center justify-center font-bold text-brand-gold border border-brand-gold/10">
                {row.profiles?.full_name?.[0] || 'M'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#2B2620] text-sm">{row.profiles?.full_name || 'Anonymous User'}</span>
                <span className="text-[10px] text-brand-text/30 font-black uppercase tracking-tighter">{row.profiles?.phone_number || 'No Phone'}</span>
              </div>
        </div>
      )
    },
    { header: 'Admitted On', render: (row) => <span className="text-xs font-medium text-brand-text/60">{new Date(row.joined_at).toLocaleDateString()}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.is_winner ? 'Winner' : 'Participant'} /> },
    { header: 'Wallet', render: (row) => <span className="text-xs font-black text-[#2B2620] uppercase">Active</span> }
  ]

  const contributionColumns = [
    { header: 'Member', render: (row) => <span className="font-bold text-[#2B2620] text-sm">{row.profiles?.full_name}</span> },
    { header: 'Month', render: (row) => <span className="text-xs font-black text-brand-gold">Cycle {row.month_number}</span> },
    { header: 'Amount', render: (row) => <span className="text-xs font-bold text-[#2B2620]">₹{Number(row.amount).toLocaleString()}</span> },
    { header: 'Payment Date', render: (row) => <span className="text-xs text-brand-text/40">{row.paid_at ? new Date(row.paid_at).toLocaleDateString() : 'Pending'}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ]

  const auctionColumns = [
    { header: 'Cycle', render: (row) => <span className="font-bold text-[#2B2620]">Month {row.month_number}</span> },
    { header: 'Winner', render: (row) => <span className="font-bold text-brand-gold">{row.profiles?.full_name}</span> },
    { header: 'Bid Amount', render: (row) => <span className="text-xs font-bold text-[#2B2620]">₹{Number(row.bid_amount).toLocaleString()}</span> },
    { header: 'Dividend', render: (row) => <span className="text-xs text-green-600 font-bold">₹{Number(row.dividend_amount).toLocaleString()}</span> },
    { header: 'Date', render: (row) => <span className="text-[10px] text-brand-text/30 font-black uppercase">{new Date(row.created_at).toLocaleDateString()}</span> }
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-10 pb-20">
      
      {/* Navigation & Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/chits')}
          className="flex items-center gap-3 text-[#2B2620]/30 hover:text-brand-gold transition-colors group text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-all" />
          Back to Protocols
        </button>
        <div className="flex items-center gap-4">
           <button className="p-4 bg-white border border-brand-gold/10 rounded-2xl text-[#2B2620]/40 hover:text-[#2B2620] hover:shadow-xl transition-all shadow-sm">
              <Plus className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Hero Management Card */}
      <header className="heritage-gradient rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-brand-gold/20">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-gold/5 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
        <Landmark className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-white/5 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="px-5 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-brand-gold text-[10px] font-black uppercase tracking-[0.3em]">
                   {chit.chit_type} PROTOCOL
                 </div>
                 <StatusBadge status={chit.status} />
              </div>
              <h1 className="text-5xl md:text-6xl font-headline font-bold leading-tight">{chit.name}</h1>
              <div className="flex items-center gap-8 text-[12px] font-bold text-white/40">
                 <div className="flex items-center gap-3">
                   <Users className="w-4 h-4 text-brand-gold" />
                   {chit.chit_members?.length || 0} / {max} Members Admitted
                 </div>
                 <div className="flex items-center gap-3">
                   <ArrowRight className="w-3 h-3 text-brand-gold" />
                   <span className="text-[9px] font-black uppercase text-white tracking-tighter">
                     {getNextAction()}
                   </span>
                 </div>
              </div>
           </div>

           <div className="w-full xl:w-96 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                 <span>Collection Progress</span>
                 <span className="text-brand-gold">₹{financials.collected.toLocaleString()} Target</span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden flex shadow-inner">
                 <div 
                   className="bg-brand-gold h-full transition-all duration-1000 ease-out"
                   style={{ width: `${Math.min(100, (financials.collected / (totalValue || 1)) * 100)}%` }}
                 />
                 <div 
                   className="bg-red-400 h-full transition-all duration-1000 ease-out"
                   style={{ width: `${Math.min(100, (financials.pending / (totalValue || 1)) * 100)}%` }}
                 />
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Total Value</span>
                    <span className="text-2xl font-headline font-bold text-brand-gold">₹{totalValue.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Defaults</span>
                    <span className={`text-2xl font-headline font-bold ${financials.defaults > 0 ? 'text-red-400' : 'text-green-400'}`}>
                       {financials.defaults}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Controls */}
        <div className="mt-12 relative z-10 p-2 bg-white/5 rounded-[2rem] border border-white/5">
           <ActionButtons chit={chit} />
        </div>
      </header>

      {/* Dashboard Tabs */}
      <div className="space-y-10">
        <div className="flex flex-wrap gap-10 border-b border-brand-gold/10 px-8 pb-1">
          {[
            { id: 'members', label: 'Beneficiaries', icon: Users },
            { id: 'contributions', label: 'Financial Ledger', icon: Coins },
            { id: 'auctions', label: 'Auction Timeline', icon: Gavel },
            { id: 'analytics', label: 'Intelligence', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-8 text-[11px] font-black uppercase tracking-[0.25em] transition-all relative flex items-center gap-3 ${
                activeTab === tab.id ? 'text-[#2B2620] -translate-y-1' : 'text-brand-text/30 hover:text-brand-text/60'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-gold' : ''}`} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-brand-gold rounded-full shadow-lg shadow-brand-gold/30"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[400px]">
          {activeTab === 'members' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
               <div className="flex justify-between items-center px-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-bold text-[#2B2620]">Admitted Beneficiaries</h3>
                    <p className="text-sm text-brand-text/40 font-medium italic">Verified participants in this chit protocol cycle.</p>
                  </div>
                  {chit.status === 'forming' && (
                    <button 
                      onClick={() => navigate('/members')}
                      className="bg-brand-gold text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:translate-x-1 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Beneficiary
                    </button>
                  )}
               </div>
               <div className="bg-white rounded-[3rem] border border-brand-gold/10 p-6 shadow-sm overflow-hidden">
                <DataTable columns={memberColumns} data={chit.chit_members || []} />
               </div>
            </div>
          )}

          {activeTab === 'contributions' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
               <div className="flex justify-between items-center px-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-bold text-[#2B2620]">Global Subscription Ledger</h3>
                    <p className="text-sm text-brand-text/40 font-medium italic">Comprehensive premium tracking across all cycles.</p>
                  </div>
               </div>
               <div className="bg-white rounded-[3rem] border border-brand-gold/10 p-6 shadow-sm overflow-hidden">
                <DataTable columns={contributionColumns} data={chit.contributions || []} />
               </div>
            </div>
          )}

          {activeTab === 'auctions' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
               <div className="flex justify-between items-center px-4">
                  <div className="space-y-1">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-[#2B2620] leading-tight line-clamp-1 group-hover:text-brand-gold transition-colors">
                        {chit.name}
                      </h3>
                      <p className="text-sm text-brand-text/40 font-medium italic">Historical winner selection and dividend distribution data.</p>
                    </div>
                  </div>
               </div>
               {chit.auctions && chit.auctions.length > 0 ? (
                 <div className="bg-white rounded-[3rem] border border-brand-gold/10 p-6 shadow-sm overflow-hidden">
                   <DataTable columns={auctionColumns} data={chit.auctions} />
                 </div>
               ) : (
                 <div className="bg-white rounded-[3rem] p-20 text-center border border-brand-gold/5 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-[#2B2620]/5 rounded-full flex items-center justify-center mb-6">
                       <History className="w-10 h-10 text-[#2B2620]/20" />
                    </div>
                    <p className="text-[#2B2620] font-bold text-xl">No Auction Records Found</p>
                    <p className="text-brand-text/40 text-sm mt-2">Bidding cycles will appear here once the protocol is active.</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="py-32 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
               <div className="w-28 h-28 heritage-gradient rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-brand-gold/20">
                 <ShieldCheck className="w-14 h-14 text-white" />
               </div>
               <h4 className="text-3xl font-headline font-bold text-[#2B2620]">Intelligence Engine Online</h4>
               <p className="text-brand-text/40 text-xs font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 Aggregating Real-time Liquidity Data
               </p>
               <p className="mt-8 text-sm text-brand-text/60 max-w-sm text-center leading-relaxed">
                 The financial intelligence layer is processing collection velocity and default probability models for this protocol.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChitDetails
