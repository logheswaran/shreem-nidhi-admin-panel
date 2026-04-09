import React, { useState, useMemo, useEffect } from 'react'
import { 
  Check, X, ShieldCheck, Calendar, Phone, Info, 
  ArrowUpRight, LayoutGrid, Search, Filter, 
  TrendingUp, Users, Clock, AlertCircle, Plus,
  ChevronRight, BrainCircuit
} from 'lucide-react'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import RiskBadge from '../../shared/components/ui/RiskBadge'
import PremiumDropdown from '../../shared/components/ui/PremiumDropdown'
import { useApplications, useApplicationActions } from './hooks'
import { useChits } from '../chits/hooks'
import ApplicationDetailModal from './components/ApplicationDetailModal'
import toast from 'react-hot-toast'

const Applications = () => {
  const { data: apps = [], isLoading: loading, isError, error } = useApplications()
  const { approve, reject, requestInfo, isLoading: processing } = useApplicationActions()
  const { data: chits = [] } = useChits()
  
  // Local state for combined real and updated data
  const [localApps, setLocalApps] = useState([])
  const [activePipeline, setActivePipeline] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [selectedApp, setSelectedApp] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Sync server data with local state
  useEffect(() => {
    setLocalApps(apps)
  }, [apps])

  // Handle Fetch Errors
  useEffect(() => {
    if (isError) {
      toast.error('Failed to sync with central database: ' + (error?.message || 'Unknown error'))
    }
  }, [isError, error])

  // Pipeline Filtering Logic
  const filteredByPipeline = useMemo(() => {
    return localApps.filter(app => {
      if (activePipeline === 'pending') return app.status === 'pending' || app.status === 'info_requested'
      if (activePipeline === 'approved') return app.status === 'approved'
      if (activePipeline === 'rejected') return app.status === 'rejected'
      return true
    })
  }, [localApps, activePipeline])

  const processedApps = useMemo(() => {
    return filteredByPipeline.filter(app => {
      const name = app.profiles?.full_name || ''
      const phone = app.profiles?.mobile_number || ''
      const chitName = app.chits?.name || ''

      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm) ||
        chitName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRisk = riskFilter === 'ALL' || app.risk?.level === riskFilter
      
      return matchesSearch && matchesRisk
    })
  }, [filteredByPipeline, searchTerm, riskFilter])

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = localApps.length
    const pending = localApps.filter(a => a.status === 'pending').length
    const highRisk = localApps.filter(a => a.risk?.level === 'HIGH').length
    const approvedRate = total > 0 ? ((localApps.filter(a => a.status === 'approved').length / total) * 100).toFixed(0) : 0
    
    return { total, pending, highRisk, approvedRate }
  }, [localApps])

  // Action Handlers
  const handleApprove = async (id) => {
    try {
      await approve(id)
      setLocalApps(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', reviewed_at: new Date().toISOString() } : a))
      setIsDetailOpen(false)
    } catch (e) {
      toast.error('Approval failed: ' + (e.message || 'Check database permissions'))
    }
  }

  const handleReject = async ({ id, reason }) => {
    try {
      await reject({ id, reason })
      setLocalApps(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() } : a))
      setIsDetailOpen(false)
    } catch (e) {
      toast.error('Rejection failed: ' + (e.message || 'Check database permissions'))
    }
  }

  const handleRequestInfo = async ({ id, message }) => {
    try {
      await requestInfo({ id, message })
      setLocalApps(prev => prev.map(a => a.id === id ? { ...a, status: 'info_requested' } : a))
      setIsDetailOpen(false)
    } catch (e) {
      toast.error('Information request failed: ' + (e.message || 'Check status constraints in DB'))
    }
  }


  const columns = [
    { 
      header: 'Applicant Identity', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl heritage-gradient flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
            {row.profiles?.full_name?.[0] || 'A'}
          </div>
          <div>
            <p className="font-bold text-[#2B2620] leading-none mb-1.5">{row.profiles?.full_name}</p>
            <div className="flex items-center gap-2">
               <Phone className="w-2.5 h-2.5 text-brand-gold" />
               <p className="text-[9px] text-brand-text/40 font-bold uppercase tracking-widest">{row.profiles?.mobile_number}</p>
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Endowment Target', 
      render: (row) => (
        <div>
          <span className="font-headline font-bold text-[#2B2620] block leading-none">{row.chits?.name}</span>
          <span className="text-[9px] text-brand-text/40 font-bold uppercase tracking-widest mt-1 inline-block">Maturity: ₹{Number(row.chits?.total_value || 0).toLocaleString()}</span>
        </div>
      ) 
    },
    { 
      header: 'Intelligence', 
      render: (row) => (
        <div className="flex flex-col gap-1.5">
           <RiskBadge level={row.risk?.level} />
           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-ivory/50 rounded-full border border-brand-gold/5 w-fit">
              <ShieldCheck className={`w-2.5 h-2.5 ${row.kyc_status === 'verified' ? 'text-green-500' : 'text-amber-500'}`} />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">KYC {row.kyc_status}</span>
           </div>
        </div>
      )
    },
    { 
      header: 'Admission Date', 
      render: (row) => (
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-[#2B2620]/60">{new Date(row.applied_at).toLocaleDateString()}</span>
           <span className="text-[8px] font-black uppercase tracking-widest text-brand-text/20">Institutional Entry</span>
        </div>
      )
    },
    { header: 'Current Phase', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Review Actions', 
      render: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedApp(row);
            setIsDetailOpen(true);
          }}
          className="group relative flex items-center justify-center gap-2 bg-white hover:heritage-gradient text-[#2B2620] hover:text-white border border-brand-gold/20 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
        >
          {row.status === 'pending' || row.status === 'info_requested' ? 'Institutional Review' : 'View Dossier'}
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )
    }
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 📊 PIPELINE HEAD & TABS */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-gold/10 rounded-xl">
               <BrainCircuit className="w-6 h-6 text-brand-gold" />
            </div>
            <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Onboarding Pipeline</h2>
          </div>
          <p className="text-on-surface-variant font-body opacity-70 ml-1">Underwriting and admission control for prospective members.</p>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-brand-gold/10 shadow-inner">
           {['pending', 'approved', 'rejected'].map(tab => {
             const count = localApps.filter(a => {
               if (tab === 'pending') return a.status === 'pending' || a.status === 'info_requested'
               return a.status === tab
             }).length
             return (
               <button
                 key={tab}
                 onClick={() => setActivePipeline(tab)}
                 className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activePipeline === tab ? 'heritage-gradient text-white shadow-lg' : 'text-[#2B2620]/40 hover:text-[#2B2620] hover:bg-brand-gold/5'}`}
               >
                 {tab} 
                 <span className={`px-2 py-0.5 rounded-full text-[9px] ${activePipeline === tab ? 'bg-white/20 text-white' : 'bg-brand-gold/10 text-brand-goldDark'}`}>
                   {count}
                 </span>
               </button>
             )
           })}
        </div>
      </header>

      {/* 🧠 PIPELINE INTELLIGENCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
           <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold shrink-0">
              <Users className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Queue Depth</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{loading ? '...' : kpis.total}</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md border-b-4 border-b-brand-gold/30 flex items-center gap-4">
           <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold shrink-0">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Awaiting Review</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{loading ? '...' : kpis.pending}</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md border-b-4 border-b-red-500/30 flex items-center gap-4">
           <div className="p-4 rounded-full bg-red-500/10 text-red-500 shrink-0">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">High Risk Detected</p>
              <p className="text-2xl font-headline font-bold text-red-600">{loading ? '...' : kpis.highRisk}</p>
           </div>
        </div>

        <div className="heritage-gradient p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-4">
           <div className="p-4 rounded-full bg-white/10 text-white shrink-0">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Approval Velocity</p>
              <p className="text-2xl font-headline font-bold">{loading ? '...' : kpis.approvedRate}%</p>
           </div>
        </div>
      </div>

      {/* 🔍 SEARCH & ACTION BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
          <input 
            className="w-full bg-white border border-brand-gold/10 rounded-full py-4 pl-14 pr-6 text-sm font-body focus:ring-2 focus:ring-brand-gold/20 focus:outline-none transition-all shadow-sm"
            placeholder="Search by Name, Reference, or Scheme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
           <PremiumDropdown 
             className="min-w-[200px]"
             value={riskFilter}
             onChange={(val) => setRiskFilter(val)}
             options={[
               { value: 'ALL', label: 'All Risk Levels' },
               { value: 'LOW', label: 'Low Risk' },
               { value: 'MEDIUM', label: 'Medium Risk' },
               { value: 'HIGH', label: 'High Risk' }
             ]}
           />
        </div>
      </div>

      {/* 📜 TABLE DOCK */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-brand-gold/10 overflow-hidden soft-glow">
        <DataTable 
          columns={columns} 
          data={processedApps} 
          loading={loading} 
          onRowClick={(row) => {
            setSelectedApp(row);
            setIsDetailOpen(true);
          }}
        />
      </div>

      {/* 👁️ INTELLIGENCE MODALS */}
      <ApplicationDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        application={selectedApp}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestInfo={handleRequestInfo}
        processing={processing}
      />
    </div>
  )
}

export default Applications
