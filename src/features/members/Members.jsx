import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Download, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Users as UsersIcon,
  Search,
  Wallet,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react'
import { useMembers } from './useMembers'
import { useRiskAnalysis } from '../risk/hooks/useRiskAnalysis'
import { useChits } from '../chits/hooks'
import { useDebounce } from '../../shared/hooks/useDebounce'
import { useAuth } from '../../core/providers/AuthProvider'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import RiskBadge from '../../shared/components/ui/RiskBadge'
import MemberFormModal from './components/MemberFormModal'
import MemberQuickViewModal from './components/MemberQuickViewModal'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'
import PremiumDropdown from '../../shared/components/ui/PremiumDropdown'
import { exportToCSV, exportToPDF } from '../../shared/utils/exportUtils'
import toast from 'react-hot-toast'

const Members = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { loading: memberLoading, stats, statsLoading, addMember, editMember, removeMember } = useMembers()
  const { all: members, isLoading: riskLoading } = useRiskAnalysis()
  const loading = memberLoading || riskLoading
  const searchRef = useRef(null)

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('All members')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [showAlerts, setShowAlerts] = useState(true)
  const [selectedChitId, setSelectedChitId] = useState('all')

  const { data: chits = [], isLoading: chitsLoading } = useChits('all')

  const debouncedSearch = useDebounce(searchTerm, 300)



  // DYNAMIC TAB GENERATION (Updated to use actual Chits)
  const dynamicTabs = useMemo(() => {
    const defaultTabs = ['All members']
    const chitTabs = chits.map(chit => chit.name)
    return [...defaultTabs, ...chitTabs]
  }, [chits])

  // Filter & Sort Logic
  const processedMembers = useMemo(() => {
    let result = [...members]

    // Search Filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      result = result.filter(m => 
        m.profiles?.full_name?.toLowerCase().includes(search) ||
        m.profiles?.mobile_number?.includes(search) ||
        m.id.toLowerCase().includes(search) ||
        m.chits?.name?.toLowerCase().includes(search)
      )
    }

    // Chit Selection Filter (Primary: ID)
    if (selectedChitId !== 'all') {
      result = result.filter(m => String(m.chit_id) === String(selectedChitId))
    } 
    // Fallback name-based filter (Only if ID match impossible) - DEPRECATED in favor of ID stability
    // else if (activeTab !== 'All members') {
    //   result = result.filter(m => m.chits?.name === activeTab)
    // }

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter)
    }

    // Risk Filter
    if (riskFilter !== 'all') {
      result = result.filter(m => m.risk.level === riskFilter)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') return (a.profiles?.full_name || '').localeCompare(b.profiles?.full_name || '')
      if (sortBy === 'contribution') return (b.total_contribution || 0) - (a.total_contribution || 0)
      if (sortBy === 'overdue') return (b.risk?.pending || 0) - (a.risk?.pending || 0)
      if (sortBy === 'newest') return new Date(b.joined_at) - new Date(a.joined_at)
      return 0
    })

    return result
  }, [members, debouncedSearch, activeTab, statusFilter, riskFilter, sortBy])

  // TABULAR STATS CALCULATION (Dynamic based on Tab)
  const currentStats = useMemo(() => {
    // Determine which members to evaluate (ID-based Selection)
    const filtered = selectedChitId !== 'all'
      ? members.filter(m => String(m.chit_id) === String(selectedChitId))
      : members

    const total = filtered.length
    const active = filtered.filter(m => m.status === 'active').length
    const defaulters = filtered.filter(m => m.status === 'defaulter' || m.risk?.level === 'HIGH').length
    
    // Portfolio: Total successfully contributed amount by these members
    const portfolioValue = filtered.reduce((acc, m) => acc + (m.total_contribution || 0), 0)
    
    // Monthly Flow: Target revenue from active members in this tab
    const monthlyCollected = filtered
      .reduce((acc, m) => acc + (m.chits?.monthly_amount || 0), 0)

    return { total, active, defaulters, portfolioValue, monthlyCollected }
  }, [members, activeTab, selectedChitId])
  const columns = useMemo(() => {
    return [
      {
        header: 'Member Identity',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAEEDA] flex items-center justify-center text-[#633806] font-bold text-xs shadow-sm">
              {row.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-[#2B2620] leading-none mb-0.5">{row.profiles?.full_name || 'Anonymous'}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/30">ID: {row.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        )
      },
      {
        header: 'Risk Grade',
        render: (row) => <RiskBadge level={row.risk.level} reason={row.risk.reason} />
      },
      {
        header: 'Financial Health',
        render: (row) => {
          const pending = row.risk?.pending || 0
          
          return (
            <div>
              <span className={`text-[11px] font-bold block ${pending > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {pending > 0 ? `₹${pending.toLocaleString()} Pending` : 'Clear Balance'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30">
                Paid: ₹{(row.total_contribution || 0).toLocaleString()}
              </span>
            </div>
          )
        }
      },
      { 
        header: 'Standing', 
        render: (row) => {
          const statusMap = {
            'active': { label: 'Active', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
            'defaulter': { label: 'Defaulter', bg: 'bg-red-50', text: 'text-red-600' },
            'won': { label: 'Won', bg: 'bg-[#FAEEDA]', text: 'text-[#633806]' },
            'matured': { label: 'Matured', bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]' }
          }
          const s = statusMap[row.status] || { label: row.status, bg: 'bg-gray-50', text: 'text-gray-600' }
          return (
            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[0.1em] uppercase ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          )
        }
      },
      {
        header: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-1">
            <button 
              title="View Deep Profile" 
              onClick={(e) => { e.stopPropagation(); setSelectedMember(row); }} 
              className="p-1.5 hover:bg-[#FAEEDA]/50 text-[#BA7517] transition-all rounded-lg cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              title="Edit Records" 
              onClick={(e) => { e.stopPropagation(); setEditingMember(row); }} 
              className="p-1.5 hover:bg-[#FAEEDA]/50 text-[#BA7517] transition-all rounded-lg cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {isAdmin && (
              <button 
                title="Terminate Record"
                onClick={(e) => { e.stopPropagation(); setDeleteTargetId(row.id); setShowDeleteConfirm(true); }}
                className="p-1.5 hover:bg-red-50 text-red-500 transition-all rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              title="Audit History" 
              onClick={(e) => { e.stopPropagation(); navigate(`/members/${row.id}`); }} 
              className="p-1.5 hover:bg-gray-50 text-gray-400 transition-all rounded-lg ml-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )
      }
    ]
  }, [isAdmin, navigate])

  const handleExport = (type = 'csv') => {
    const exportCols = [
      { header: 'Full Name', accessor: 'profiles.full_name' },
      { header: 'Phone', accessor: 'profiles.mobile_number' },
      { header: 'Email', accessor: 'profiles.email' },
      { header: 'Chit', accessor: 'chits.name' },
      { header: 'Pending Amount', accessor: 'pending_amount' },
      { header: 'Risk Level', accessor: 'risk_level' },
      { header: 'Status', accessor: 'status' }
    ]
    
    const data = processedMembers.map(m => {
      const pending = m.risk?.pending || 0
      
      return {
        ...m,
        'profiles.full_name': m.profiles?.full_name,
        'profiles.mobile_number': m.profiles?.mobile_number,
        'profiles.email': m.profiles?.email,
        'chits.name': m.chits?.name || 'Unassigned',
        'pending_amount': `₹${pending.toLocaleString()}`,
        'risk_level': m.risk.level,
        'status': m.status.toUpperCase()
      }
    })

    if (type === 'pdf') {
      exportToPDF(data, exportCols, `SreemNidhi_${activeTab}_Registry`)
      toast.success('Registry exported as PDF')
    } else {
      exportToCSV(data, exportCols, `SreemNidhi_${activeTab}_Registry`)
      toast.success('Registry exported as CSV')
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Members Registry</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Financial intelligence and risk monitoring system.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <button className="px-6 py-3 bg-white text-[#2B2620] text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm active:scale-95">
              <Download className="w-4 h-4" /> Export Registry
            </button>
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-brand-gold/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden w-40">
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-3 text-left text-[10px] font-bold text-[#2B2620] hover:bg-brand-gold/10 transition-colors uppercase tracking-widest">Excel (CSV)</button>
              <button onClick={() => handleExport('pdf')} className="w-full px-4 py-3 text-left text-[10px] font-bold text-[#2B2620] hover:bg-brand-gold/10 transition-colors uppercase tracking-widest border-t border-brand-gold/5">Dossier (PDF)</button>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="heritage-gradient px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 shadow-xl hover:brightness-110 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Enroll New Member
          </button>
        </div>
      </header>

      {/* 0. Top 5 Risky Members Banner */}
      {showAlerts && members.filter(m => m.risk.level === 'HIGH').length > 0 && (
        <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-red-50 border border-red-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-100/30">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-900 leading-none">Priority Risk Monitoring</h3>
                  <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-wider">Top 5 members requiring immediate administrative intervention</p>
                </div>
              </div>
              <button onClick={() => setShowAlerts(false)} className="p-2 hover:bg-red-100/50 rounded-full text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
              {members
                .filter(m => m.risk.level === 'HIGH')
                .slice(0, 5)
                .map((m, idx) => {
                   const pending = m.risk?.pending || 0
                   
                   return (
                     <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-red-100 hover:shadow-md transition-all group">
                        <p className="text-xs font-black text-[#2B2620] truncate mb-1">{m.profiles?.full_name}</p>
                        <p className="text-[10px] font-black text-red-600 mb-3 tracking-widest">₹{pending.toLocaleString()} PENDING</p>
                        <button 
                          onClick={() => setSelectedMember(m)}
                          className="w-full py-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg group-hover:bg-red-600 transition-colors"
                        >
                          Protocol Check
                        </button>
                     </div>
                   )
                })}
            </div>
          </div>
        </div>
      )}

      {/* 1. Investment Plans Selection (NEW) */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-headline font-bold text-[#2B2620]">Strategic Investment Plans</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/40 mt-1">Select a plan to visualize associated member portfolios</p>
          </div>
          <button 
            onClick={() => { setSelectedChitId('all'); setActiveTab('All members'); }}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
              selectedChitId === 'all' 
                ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' 
                : 'bg-white text-brand-text/60 border border-brand-gold/10 hover:bg-brand-gold/5'
            }`}
          >
            Reset Selection
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 snap-x">
          {/* All Members Card */}
          <div 
            onClick={() => { setSelectedChitId('all'); setActiveTab('All members'); }}
            className={`min-w-[200px] p-6 rounded-[2rem] border-2 transition-all cursor-pointer snap-start flex flex-col justify-between ${
              selectedChitId === 'all' 
                ? 'bg-brand-gold border-brand-gold shadow-xl shadow-brand-gold/20 scale-105' 
                : 'bg-white border-brand-gold/10 hover:border-brand-gold/30'
            }`}
          >
            <div className={`p-3 rounded-2xl w-fit mb-4 ${selectedChitId === 'all' ? 'bg-white/20' : 'bg-brand-gold/10'}`}>
              <UsersIcon className={`w-5 h-5 ${selectedChitId === 'all' ? 'text-white' : 'text-brand-gold'}`} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedChitId === 'all' ? 'text-white/60' : 'text-brand-text/40'}`}>Registry Overview</p>
              <p className={`text-lg font-headline font-bold ${selectedChitId === 'all' ? 'text-white' : 'text-[#2B2620]'}`}>Global Directory</p>
            </div>
          </div>

          {/* Individual Chit Cards */}
          {chits.map((chit) => (
            <div 
              key={chit.id}
              onClick={() => { 
                setSelectedChitId(chit.id); 
                setActiveTab(chit.name);
              }}
              className={`min-w-[280px] p-6 rounded-[2rem] border-2 transition-all cursor-pointer snap-start flex flex-col justify-between relative overflow-hidden group ${
                selectedChitId === chit.id 
                  ? 'bg-white border-brand-gold shadow-xl shadow-brand-gold/10 scale-105' 
                  : 'bg-white border-brand-gold/5 hover:border-brand-gold/20'
              }`}
            >
              {selectedChitId === chit.id && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-[4rem] flex items-center justify-center pl-4 pb-4">
                  <ShieldCheck className="w-6 h-6 text-brand-gold" />
                </div>
              )}
              
              <div className="relative z-10">
                <div className="flex gap-2 mb-4">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    chit.chit_type === 'random' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-gold/10 text-brand-gold'
                  }`}>
                    {chit.chit_type}
                  </span>
                  <StatusBadge status={chit.status} size="sm" />
                </div>
                
                <h4 className="text-xl font-headline font-bold text-[#2B2620] mb-2 group-hover:text-brand-gold transition-colors">{chit.name}</h4>
                <div className="flex items-center gap-4 text-brand-text/50">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{chit.members_count || 0}/{chit.max_members || chit.total_members || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    <span className="text-[10px] font-bold">₹{(chit.monthly_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-gold/5 flex justify-between items-center">
                 <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/30">Select Protocol</p>
                 <ArrowUpDown className={`w-4 h-4 transition-transform ${selectedChitId === chit.id ? 'rotate-180 text-brand-gold' : 'text-brand-text/20 group-hover:text-brand-gold/50'}`} />
              </div>
            </div>
          ))}

          {chitsLoading && [1,2,3].map(i => (
            <div key={i} className="min-w-[280px] h-[180px] bg-white border border-brand-gold/5 rounded-[2rem] animate-pulse p-6">
              <div className="w-1/2 h-4 bg-gray-100 rounded mb-4" />
              <div className="w-3/4 h-8 bg-gray-100 rounded mb-6" />
              <div className="w-full h-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </section>
      {/* 📊 KPI Summary Cards: Dashboard Parity Pass */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
           <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold shrink-0">
              <UsersIcon className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Total Members</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{currentStats.total}</p>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md border-b-4 border-b-green-500/30 flex items-center gap-4">
           <div className="p-4 rounded-full bg-green-500/10 text-green-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Active Assets</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{currentStats.active}</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md border-b-4 border-b-red-500/30 flex items-center gap-4">
           <div className="p-4 rounded-full bg-red-500/10 text-red-500 shrink-0">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Defaulters</p>
              <p className="text-2xl font-headline font-bold text-red-600">{currentStats.defaulters}</p>
           </div>
        </div>

        <div className="heritage-gradient p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-4">
           <div className="p-4 rounded-full bg-white/10 text-white shrink-0">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Portfolio Value</p>
              <p className="text-2xl font-headline font-bold">₹{(currentStats.portfolioValue || 0).toLocaleString()}</p>
           </div>
        </div>

        <div className="bg-brand-ivory p-6 rounded-[2rem] border border-brand-gold/20 shadow-sm flex items-center gap-4">
           <div className="p-4 rounded-full bg-brand-gold/10 text-brand-goldDark shrink-0">
              <Wallet className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Monthly Flow</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">₹{(currentStats.monthlyCollected || 0).toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
          <input 
            ref={searchRef}
            className="w-full bg-white/50 backdrop-blur-sm border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-body focus:ring-0 focus:outline-none transition-all placeholder:text-brand-text/20 shadow-sm"
            placeholder="Search Name, Phone, ID, or Chit Scheme..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          {/* Status Filter */}
          <PremiumDropdown 
             className="min-w-[160px]"
             value={statusFilter}
             onChange={(val) => setStatusFilter(val)}
             options={[
               { value: 'all', label: 'Any Status' },
               { value: 'active', label: 'Active' },
               { value: 'defaulter', label: 'Defaulter' },
               { value: 'won', label: 'Won Chits' }
             ]}
           />

          {/* Risk Filter */}
          <PremiumDropdown 
             className="min-w-[160px]"
             value={riskFilter}
             onChange={(val) => setRiskFilter(val)}
             options={[
               { value: 'all', label: 'Any Risk' },
               { value: 'LOW', label: 'Low Risk' },
               { value: 'MEDIUM', label: 'Med Risk' },
               { value: 'HIGH', label: 'High Risk' }
             ]}
           />

          {/* Sort By */}
          <PremiumDropdown 
             className="min-w-[160px]"
             value={sortBy}
             onChange={(val) => setSortBy(val)}
             options={[
               { value: 'name', label: 'Alpabetic' },
               { value: 'overdue', label: 'Most Overdue' },
               { value: 'contribution', label: 'Top Contribution' },
               { value: 'newest', label: 'Recently Joined' }
             ]}
           />
        </div>
      </div>

      {/* Main Segregation Card */}
      <div className="bg-white border-[0.5px] border-brand-gold/20 rounded-[2rem] shadow-xl overflow-hidden flex flex-col">
        {/* TAB BAR */}
        <div className="px-8 flex border-b border-brand-gold/10 overflow-x-auto no-scrollbar bg-gray-50/10">
          {dynamicTabs.map((tab) => {
            const relatedChitId = chits.find(c => c.name === tab)?.id
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  if (tab === 'All members') {
                    setSelectedChitId('all')
                  } else if (relatedChitId) {
                    setSelectedChitId(relatedChitId)
                  }
                }}
                className={`px-6 py-6 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap flex items-center gap-3 ${
                  activeTab === tab 
                    ? 'text-brand-gold translate-y-[1px]' 
                    : 'text-brand-text/30 hover:text-[#2B2620]'
                }`}
              >
                {tab}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === tab ? 'bg-brand-gold/10 text-brand-goldDark' : 'bg-gray-100 text-gray-400'
                }`}>
                  {tab === 'All members' ? members.length : members.filter(m => (m.chits?.name === tab || (relatedChitId && m.chit_id === relatedChitId))).length}
                </span>
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-gold rounded-t-full shadow-[0_-2px_10px_rgba(186,117,23,0.3)]"></div>}
              </button>
            )
          })}
        </div>

        {/* TABLE SECTION */}
        <div className="p-0">
          <DataTable 
            columns={columns} 
            data={processedMembers} 
            loading={loading} 
            onRowClick={(row) => setSelectedMember(row)}
            rowClassName="hover:bg-brand-ivory/30 cursor-pointer transition-all border-b border-brand-gold/5"
          />
        </div>
      </div>

      {/* Modals */}
      <MemberFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={addMember} />
      <MemberFormModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} onSubmit={(data) => editMember(editingMember.id, data)} initialData={editingMember} />
      <MemberQuickViewModal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} member={selectedMember} onViewFull={(id) => { setSelectedMember(null); navigate(`/members/${id}`) }} />
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => removeMember(deleteTargetId).then(() => setShowDeleteConfirm(false))} title="Remove Member Permanently?" description="This action is immutable and will terminate the beneficiary record." intent="danger" />
    </div>
  )
}

export default Members
