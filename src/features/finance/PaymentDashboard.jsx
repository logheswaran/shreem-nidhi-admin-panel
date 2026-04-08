import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ChevronRight,
  PieChart,
  X,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Banknote,
  Smartphone,
  Building2,
  ArrowRight,
  Info
} from 'lucide-react'
import GlobalModal from '../../shared/components/ui/GlobalModal'
import { financeService } from './api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const PaymentDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [chitProgress, setChitProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | ACTIVE | RISK | CRITICAL
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [schemeMembers, setSchemeMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [recordPaymentTarget, setRecordPaymentTarget] = useState(null)
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', date: new Date().toISOString().split('T')[0] })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [sum, prog] = await Promise.all([
        financeService.getCollectionSummaries(),
        financeService.getChitCollectionProgress()
      ])
      
      setSummary(sum)
      
      let enhancedProgress = []
      
      if (prog && prog.length > 0) {
        enhancedProgress = prog;
      }
      
      setChitProgress(enhancedProgress)
    } catch (error) {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- SCHEME DETAILS PANEL ---
  const openSchemeDetails = async (chit, e) => {
    e.stopPropagation()
    setSelectedScheme(chit)
    setLoadingMembers(true)
    
    try {
      // Fetch members with their payment status using service method
      const members = await financeService.getSchemeMembers(chit.id)
      setSchemeMembers(members)
    } catch (error) {
      toast.error('Failed to load member details')
      setSchemeMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  const closeSchemeDetails = () => {
    setSelectedScheme(null)
    setSchemeMembers([])
  }

  // --- RECORD PAYMENT ---
  const openRecordPayment = (member) => {
    setRecordPaymentTarget(member)
    setPaymentForm({
      amount: member.amountDue?.toString() || '',
      method: 'Cash',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const closeRecordPayment = () => {
    setRecordPaymentTarget(null)
    setPaymentForm({ amount: '', method: 'Cash', date: new Date().toISOString().split('T')[0] })
  }

  const handleRecordPayment = async () => {
    if (!recordPaymentTarget || !paymentForm.amount) {
      toast.error('Please fill in amount')
      return
    }

    setSubmitting(true)
    try {
      await financeService.recordContribution(
        recordPaymentTarget.id,
        recordPaymentTarget.monthNumber,
        parseFloat(paymentForm.amount),
        paymentForm.method,
        `Payment recorded on ${paymentForm.date}`
      )
      
      toast.success(`₹${Number(paymentForm.amount).toLocaleString()} recorded for ${recordPaymentTarget.name}`)
      
      // Update local state immediately (live update)
      setSchemeMembers(prev => prev.map(m => 
        m.id === recordPaymentTarget.id 
          ? { ...m, status: 'PAID', amountPaid: parseFloat(paymentForm.amount), paidAt: paymentForm.date }
          : m
      ))
      
      // Refresh all data
      await fetchData()
      
      // Refresh scheme members if panel is open
      if (selectedScheme) {
        const updatedChit = chitProgress.find(c => c.id === selectedScheme.id)
        if (updatedChit) {
          setSelectedScheme({ ...selectedScheme, ...updatedChit })
        }
      }
      
      closeRecordPayment()
    } catch (error) {
      toast.error(error.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  // --- COMPUTED VALUES ---
  const efficiency = useMemo(() => {
    if (!summary?.totalDueThisMonth) return 0
    return (summary.totalCollectedThisMonth / summary.totalDueThisMonth) * 100
  }, [summary])

  const filteredProgress = useMemo(() => {
    let filtered = chitProgress

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(chit => 
        chit.name?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(chit => {
        if (statusFilter === 'ACTIVE') return chit.percentage >= 80
        if (statusFilter === 'RISK') return chit.percentage >= 50 && chit.percentage < 80
        if (statusFilter === 'CRITICAL') return chit.percentage < 50
        return true
      })
    }

    return filtered
  }, [chitProgress, searchQuery, statusFilter])

  // --- STAT CARD: Dashboard Parity Pass --- //
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
      <div className={`p-4 rounded-full ${color.replace('bg-', 'bg-').split(' ')[0]}/10 ${color.split(' ')[1]} shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-headline font-bold text-[#2B2620]">₹{Number(value || 0).toLocaleString('en-IN')}</span>
        </div>
        {subtitle && <p className="text-[10px] text-brand-text/30 font-medium">{subtitle}</p>}
      </div>
    </div>
  )

  // --- PROGRESS BAR COLOR LOGIC ---
  const getProgressColor = (chit) => {
    if (!chit.totalDue || chit.totalDue === 0) return 'bg-brand-gold/40' // Pre-cycle
    if (chit.percentage >= 80) return 'bg-green-500'
    if (chit.percentage >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getStatusLabel = (chit) => {
    if (!chit.totalDue || chit.totalDue === 0) return { label: 'Pre-Cycle', class: 'bg-brand-gold/10 text-brand-gold font-bold' }
    if (chit.percentage >= 80) return { label: 'Healthy', class: 'bg-green-100 text-green-700' }
    if (chit.percentage >= 50) return { label: 'At Risk', class: 'bg-amber-100 text-amber-700' }
    return { label: 'Critical', class: 'bg-red-100 text-red-700' }
  }

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-brand-gold font-bold">Synchronizing Vault...</div>

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-[#FDFCF7] -m-8 p-8 relative overflow-hidden">
      {/* 🧊 Ice Grass Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <header className="mb-10">
        <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Payment & Collection</h2>
        <p className="text-on-surface-variant font-body mt-2 opacity-70">Monitor financial inflows and collective trust health.</p>
      </header>

      {/* Summary Cards: Standardized horizontal layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Due This Month" 
          value={summary?.totalDueThisMonth || 0} 
          icon={IndianRupee} 
          color="bg-[#2B2620] text-[#2B2620]"
        />
        <StatCard 
          title="Collected" 
          value={summary?.totalCollectedThisMonth || 0} 
          icon={TrendingUp} 
          color="bg-green-500 text-green-500" 
          subtitle={`${efficiency.toFixed(1)}% efficiency`}
        />
        <StatCard 
          title="Pending Total" 
          value={summary?.totalPending || 0} 
          icon={Clock} 
          color="bg-amber-500 text-amber-500"
        />
        <StatCard 
          title="Total Overdue" 
          value={summary?.totalOverdue || 0} 
          icon={AlertCircle} 
          color="bg-red-500 text-red-500" 
          subtitle="Requires attention"
        />
      </div>

      {/* Search & Filter Bar: Glassmorphism Passthrough */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-gold transition-colors" />
          <input
            type="text"
            placeholder="Search scheme or member name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-body focus:ring-0 focus:outline-none transition-all placeholder:text-brand-text/20 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-2 border-brand-gold/5 rounded-2xl p-1.5">
          {['ALL', 'ACTIVE', 'RISK', 'CRITICAL'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status
                  ? 'bg-[#2B2620] text-white shadow-lg'
                  : 'text-brand-text/40 hover:text-brand-gold'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Healthy' : status === 'RISK' ? 'At Risk' : 'Critical'}
            </button>
          ))}
        </div>
      </div>

      {/* Chit-wise Progress: Optimized spacing & interaction */}
      <section className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-brand-gold/10 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-brand-gold/5 flex items-center justify-between bg-brand-gold/[0.02]">
          <div>
            <h3 className="text-xl font-headline font-bold text-[#2B2620]">Collective Progress</h3>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold font-black mt-1">Real-time Scheme Performance</p>
          </div>
          <PieChart className="w-6 h-6 text-brand-gold opacity-30" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2B2620]/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Scheme Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Collection Progress</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text/40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5">
              {filteredProgress.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center text-brand-text/40">
                    No schemes found matching your criteria
                  </td>
                </tr>
              ) : filteredProgress.map((chit) => {
                const status = getStatusLabel(chit)
                return (
                  <tr 
                    key={chit.id} 
                    className="hover:bg-brand-gold/[0.04] cursor-pointer group transition-colors"
                  >
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-[#2B2620] group-hover:text-brand-gold transition-all duration-300 text-lg leading-tight">{chit.name}</span>
                        <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                          Month {chit.current_month} <span className="opacity-20">•</span> {chit.totalMembers || 0} Members
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-black text-[#2B2620] tracking-widest uppercase opacity-40">₹{(chit.totalPaid || 0).toLocaleString()} / ₹{(chit.totalDue || 0).toLocaleString()}</span>
                          <span className="text-[10px] font-black text-brand-gold">{(chit.percentage || 0).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-brand-gold/5 rounded-full overflow-hidden border border-brand-gold/5">
                          <div 
                            className={`h-full transition-all duration-1000 ${getProgressColor(chit)}`}
                            style={{ width: `${Math.min(chit.percentage || 0, 100)}%` }}
                          />
                        </div>
                        {/* 🍱 Refined breathing room with bullet separators */}
                        <div className="flex gap-4 mt-4 text-[9px] font-black uppercase tracking-[0.15em]">
                          <span className="text-green-600">{chit.membersPaid || 0} Paid</span>
                          <span className="text-brand-gold/20 font-light">•</span>
                          <span className="text-amber-500">{chit.membersPending || 0} Pending</span>
                          <span className="text-brand-gold/20 font-light">•</span>
                          <span className="text-red-500">{chit.membersOverdue || 0} Overdue</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${status.class} border border-current/10 shadow-sm`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      {/* 📐 Stable Layout: Removed group-hover:px-6 to fix sliding */}
                      <button
                        onClick={(e) => openSchemeDetails(chit, e)}
                        className="inline-flex items-center gap-2 text-brand-gold font-bold text-xs transition-all px-4 py-2.5 rounded-xl hover:bg-brand-gold/10 hover:shadow-sm"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* GLOBAL MODAL - Scheme Details (Replaces Side Drawer) */}
      <GlobalModal
        isOpen={!!selectedScheme}
        onClose={closeSchemeDetails}
        title={selectedScheme?.name}
        maxWidth="max-w-4xl"
      >
        {selectedScheme && (
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-brand-gold font-black -mt-6 mb-8">
              Month {selectedScheme.current_month} of {selectedScheme.total_months || 50}
            </p>

            {/* Quick Stats Grid: Unified Parity */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-brand-gold/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-brand-gold" />
                  <span className="text-[9px] uppercase tracking-widest text-brand-text/40 font-black">Total</span>
                </div>
                <span className="text-2xl font-headline font-bold text-[#2B2620]">{selectedScheme.totalMembers || schemeMembers.length}</span>
              </div>
              <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-[9px] uppercase tracking-widest text-green-500/40 font-black">Paid</span>
                </div>
                <span className="text-2xl font-headline font-bold text-green-600">{schemeMembers.filter(m => m.status === 'PAID').length}</span>
              </div>
              <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-[9px] uppercase tracking-widest text-amber-500/40 font-black">Pending</span>
                </div>
                <span className="text-2xl font-headline font-bold text-amber-600">{schemeMembers.filter(m => m.status === 'PENDING').length}</span>
              </div>
              <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-[9px] uppercase tracking-widest text-red-500/40 font-black">Overdue</span>
                </div>
                <span className="text-2xl font-headline font-bold text-red-600">{schemeMembers.filter(m => m.status === 'OVERDUE').length}</span>
              </div>
            </div>

            {/* Member Payment Status Table */}
            <h4 className="text-sm font-bold text-[#2B2620] mb-5 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-gold" />
              Member Payment Status
            </h4>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {schemeMembers.length === 0 ? (
                  <p className="text-center py-12 text-brand-text/40 bg-white/30 rounded-3xl border border-dashed border-brand-gold/20">No member data available</p>
                ) : schemeMembers.map((member) => (
                  <div 
                    key={member.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      member.status === 'PAID' 
                        ? 'bg-green-50/50 border-green-100/50' 
                        : member.status === 'OVERDUE'
                        ? 'bg-red-50/50 border-red-100/50'
                        : 'bg-white/60 border-brand-gold/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                          member.status === 'PAID' ? 'bg-green-500' : member.status === 'OVERDUE' ? 'bg-red-500' : 'bg-amber-500'
                        }`}>
                          {member.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-[#2B2620]">{member.name}</p>
                          <p className="text-[10px] text-brand-text/40 font-medium">{member.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-10">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-[#2B2620]">₹{Number(member.amountDue || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-brand-text/40 font-medium">Due: {member.dueDate}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${
                            member.status === 'PAID' 
                              ? 'bg-green-100 text-green-700' 
                              : member.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {member.status}
                          </span>
                          
                          {member.status !== 'PAID' && (
                            <button
                              onClick={() => openRecordPayment(member)}
                              className="px-5 py-2.5 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-goldDark transition-all active:scale-95 shadow-md shadow-brand-gold/10"
                            >
                              Record Payment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {member.status === 'PAID' && member.paidAt && (
                      <p className="text-[10px] text-green-600 mt-3 pl-[3.75rem] flex items-center gap-2 font-bold uppercase tracking-wider">
                        <div className="w-1 h-1 rounded-full bg-green-600" />
                        Paid on {new Date(member.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlobalModal>

      {/* RECORD PAYMENT MODAL - Standardized Framework */}
      <GlobalModal
        isOpen={!!recordPaymentTarget}
        onClose={closeRecordPayment}
        title="Record Payment"
        maxWidth="max-w-lg"
      >
        {recordPaymentTarget && (
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-brand-gold font-black -mt-6 mb-8">Member Registry Protocol</p>

            {/* Member Info Card */}
            <div className="bg-brand-gold/5 p-5 rounded-3xl mb-8 border border-brand-gold/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2B2620] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                {recordPaymentTarget.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-lg font-headline font-bold text-[#2B2620] leading-tight">{recordPaymentTarget.name}</p>
                <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest mt-1">{recordPaymentTarget.phone}</p>
              </div>
            </div>

            {/* Form Fields: Unified Logic */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-text/60 font-black mb-2.5 block ml-1">Amount to Record</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2B2620] font-bold text-lg">₹</span>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-10 pr-6 py-5 bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl text-xl font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 shadow-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-text/60 font-black mb-2.5 block ml-1">Payment Channel</label>
                <div className="flex gap-3">
                  {[
                    { id: 'Cash', icon: Banknote, label: 'Cash' },
                    { id: 'UPI', icon: Smartphone, label: 'UPI' },
                    { id: 'Bank', icon: Building2, label: 'Bank Transfer' }
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentForm(prev => ({ ...prev, method: id }))}
                      className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        paymentForm.method === id
                          ? 'bg-[#2B2620] text-white shadow-xl shadow-black/20'
                          : 'bg-white border border-brand-gold/10 text-brand-text/40 hover:border-brand-gold/40 hover:bg-brand-gold/[0.02]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-text/60 font-black mb-2.5 block ml-1">Effective Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/20 group-focus-within:text-brand-gold transition-colors" />
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-14 pr-6 py-5 bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              <button
                onClick={closeRecordPayment}
                className="py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text/40 border border-[#B6955E]/10 hover:bg-brand-gold/5 transition-all"
              >
                Clear Entry
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={submitting || !paymentForm.amount}
                className="py-5 heritage-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-brand-gold/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? 'Registry Syncing...' : 'Commit Payment'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </GlobalModal>
      </div>
    </div>
  )
}

export default PaymentDashboard
