import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  Search, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  History,
  ArrowRightCircle,
  Filter,
  ChevronDown
} from 'lucide-react'
import { financeService } from './api'
import { chitService } from '../chits/api'
import toast from 'react-hot-toast'
import Modal from '../../shared/components/ui/Modal'

const PaymentGrid = () => {
  const { id: chitId } = useParams()
  const navigate = useNavigate()
  const [chit, setChit] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [paymentRef, setPaymentRef] = useState('')
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | paid | pending | overdue
  const [monthRangeStart, setMonthRangeStart] = useState('')
  const [monthRangeEnd, setMonthRangeEnd] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [chitData, membersData, contData] = await Promise.all([
        chitService.getChitById(chitId),
        chitService.getChitMembers(chitId),
        financeService.getContributions(chitId)
      ])
      setChit(chitData)
      setMembers(membersData)
      setContributions(contData)
    } catch (error) {
      toast.error('Failed to load payment grid')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [chitId])

  const getStatusColor = (status, dueDate) => {
    if (status === 'paid') return 'bg-green-500 border-green-600'
    if (status === 'failed') return 'bg-red-50 border-red-500 border-2'
    if (status === 'pending') {
      const today = new Date().toISOString().split('T')[0]
      return dueDate < today ? 'bg-red-500 border-red-600' : 'bg-amber-400 border-amber-500'
    }
    return 'bg-gray-100 border-gray-200'
  }

  const handleCellClick = (member, monthNum) => {
    const contribution = contributions.find(c => 
      c.member_id === member.id && c.month_number === monthNum
    )
    if (contribution) {
      setSelectedCell({ member, monthNum, contribution })
      setPaymentMode('Cash')
      setPaymentRef('')
      setIsModalOpen(true)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedCell) return
    try {
      toast.loading('Recording cash receipt...', { id: 'pmt' })
      await financeService.recordContribution(
        selectedCell.member.id, 
        selectedCell.monthNum, 
        selectedCell.contribution.amount_due,
        paymentMode,
        paymentRef
      )
      toast.success('Beneficiary cleared!', { id: 'pmt' })
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Verification failed', { id: 'pmt' })
    }
  }

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-brand-gold font-bold">Synchronizing Vault...</div>

  const months = Array.from({ length: chit?.duration_months || 0 }, (_, i) => i + 1)
  
  // Filtered months based on range
  const displayMonths = useMemo(() => {
    let filtered = months
    if (monthRangeStart) filtered = filtered.filter(m => m >= parseInt(monthRangeStart))
    if (monthRangeEnd) filtered = filtered.filter(m => m <= parseInt(monthRangeEnd))
    return filtered
  }, [months, monthRangeStart, monthRangeEnd])
  
  // Filtered members
  const filteredMembers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    return members.filter(member => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const name = member.profiles?.full_name?.toLowerCase() || ''
        const phone = member.profiles?.mobile_number || ''
        if (!name.includes(query) && !phone.includes(query)) return false
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const memberConts = contributions.filter(c => c.member_id === member.id)
        const hasPaid = memberConts.some(c => c.payment_status === 'paid')
        const hasOverdue = memberConts.some(c => c.payment_status === 'pending' && c.due_date < today)
        const hasPending = memberConts.some(c => c.payment_status === 'pending' && c.due_date >= today)
        
        if (statusFilter === 'paid' && !hasPaid) return false
        if (statusFilter === 'overdue' && !hasOverdue) return false
        if (statusFilter === 'pending' && !hasPending) return false
      }
      
      return true
    })
  }, [members, contributions, searchQuery, statusFilter])
  
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setMonthRangeStart('')
    setMonthRangeEnd('')
  }

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/payments')}
            className="w-12 h-12 rounded-2xl bg-white border border-brand-gold/10 flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-headline font-bold text-[#2B2620]">{chit?.name}</h2>
            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-brand-gold opacity-60 mt-1">
              <Calendar className="w-3 h-3" /> Monthly Compliance Matrix
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-brand-gold/5 shadow-sm">
           <div className="flex items-center gap-2 px-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-bold text-[#2B2620]/60 uppercase">Cleared</span>
           </div>
           <div className="flex items-center gap-2 px-3">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-[10px] font-bold text-[#2B2620]/60 uppercase">Pending</span>
           </div>
           <div className="flex items-center gap-2 px-3 border-r border-brand-gold/5 mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-bold text-[#2B2620]/60 uppercase">Overdue</span>
           </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="mb-6 bg-white rounded-2xl border border-brand-gold/10 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-brand-gold/5">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30" />
              <input
                type="text"
                placeholder="Search member name or phone..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 border border-brand-gold/10 text-sm font-bold focus:outline-none focus:border-brand-gold/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                showFilters ? 'bg-brand-gold text-white border-brand-gold' : 'bg-white border-brand-gold/10 text-brand-text/60 hover:border-brand-gold/30'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {(searchQuery || statusFilter !== 'all' || monthRangeStart || monthRangeEnd) && (
            <button
              onClick={clearFilters}
              className="ml-4 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              Clear All
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="p-4 bg-gray-50/50 flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Status</label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All', color: 'bg-gray-500' },
                  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
                  { value: 'pending', label: 'Pending', color: 'bg-amber-400' },
                  { value: 'overdue', label: 'Overdue', color: 'bg-red-500' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === opt.value 
                        ? 'bg-[#2B2620] text-white' 
                        : 'bg-white border border-brand-gold/10 text-brand-text/60 hover:border-brand-gold/30'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-8 w-px bg-brand-gold/10"></div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Month Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={chit?.duration_months || 12}
                  placeholder="From"
                  className="w-20 px-3 py-1.5 rounded-lg bg-white border border-brand-gold/10 text-xs font-bold focus:outline-none focus:border-brand-gold/30"
                  value={monthRangeStart}
                  onChange={(e) => setMonthRangeStart(e.target.value)}
                />
                <span className="text-brand-text/30">—</span>
                <input
                  type="number"
                  min="1"
                  max={chit?.duration_months || 12}
                  placeholder="To"
                  className="w-20 px-3 py-1.5 rounded-lg bg-white border border-brand-gold/10 text-xs font-bold focus:outline-none focus:border-brand-gold/30"
                  value={monthRangeEnd}
                  onChange={(e) => setMonthRangeEnd(e.target.value)}
                />
              </div>
            </div>
            
            <div className="ml-auto text-xs text-brand-text/40 font-bold">
              Showing {filteredMembers.length} of {members.length} members
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2B2620]/[0.02]">
                <th className="sticky left-0 z-20 bg-[#2B2620]/[0.02] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-text/40 border-b border-brand-gold/5">Delegate Participant</th>
                {displayMonths.map(m => (
                  <th key={m} className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest text-brand-text/40 border-b border-brand-gold/5 whitespace-nowrap min-w-[80px]">
                    Cycle {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={displayMonths.length + 1} className="px-8 py-12 text-center">
                    <div className="text-brand-text/30 text-sm font-bold">No members match your filters</div>
                    <button onClick={clearFilters} className="text-brand-gold text-xs font-bold mt-2 hover:underline">Clear filters</button>
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-brand-gold/[0.01] transition-colors group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-brand-gold/[0.01] px-8 py-4 border-r border-brand-gold/5 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-xl bg-[#2B2620] text-white flex items-center justify-center font-bold text-xs">
                          {member.profiles?.full_name?.[0]}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#2B2620] line-clamp-1">{member.profiles?.full_name}</span>
                          <span className="text-[10px] text-brand-text/30 font-bold tracking-tighter uppercase">{member.profiles?.mobile_number}</span>
                       </div>
                    </div>
                  </td>
                  {displayMonths.map(m => {
                    const cont = contributions.find(c => c.member_id === member.id && c.month_number === m)
                    return (
                      <td key={m} className="px-4 py-4 text-center">
                        {cont ? (
                          <div 
                            onClick={() => handleCellClick(member, m)}
                            className={`w-8 h-8 rounded-xl mx-auto cursor-pointer transition-all hover:scale-110 shadow-sm border ${getStatusColor(cont.payment_status, cont.due_date)}`}
                          ></div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl mx-auto bg-gray-50 border border-dashed border-gray-200"></div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registry Verification">
         {selectedCell && (
           <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-brand-gold/[0.03] rounded-3xl border border-brand-gold/5">
                 <div className="w-16 h-16 rounded-2xl bg-[#2B2620] flex items-center justify-center text-white text-2xl font-bold">
                    {selectedCell.member.profiles?.full_name?.[0]}
                 </div>
                 <div>
                    <h4 className="text-2xl font-headline font-bold text-[#2B2620]">{selectedCell.member.profiles?.full_name}</h4>
                    <p className="text-sm text-brand-gold font-bold tracking-widest uppercase opacity-60">Cycle Reference: Month {selectedCell.monthNum}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-3xl border border-brand-gold/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Required Installment</span>
                    <span className="text-2xl font-headline font-bold text-[#2B2620]">₹{Number(selectedCell.contribution.amount_due).toLocaleString()}</span>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-brand-gold/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 block mb-2">Current Status</span>
                    <div className="flex items-center gap-2">
                       {selectedCell.contribution.payment_status === 'paid' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                       <span className={`text-sm font-bold uppercase tracking-widest ${selectedCell.contribution.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {selectedCell.contribution.payment_status}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                 <History className="w-6 h-6 text-amber-600 shrink-0" />
                 <p className="text-xs text-amber-900 leading-relaxed">
                    By authorizing this registry update, you confirm that physical or digital currency has been received from the delegate. This action is immutable and will be logged in the Master Ledger.
                 </p>
              </div>

              {selectedCell.contribution.payment_status !== 'paid' && (
                <div className="space-y-4 pt-4 border-t border-brand-gold/10">
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">Payment Mode</label>
                     <div className="flex gap-2">
                       {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(mode => (
                         <button
                           key={mode}
                           onClick={() => setPaymentMode(mode)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                             paymentMode === mode 
                               ? 'bg-[#2B2620] text-white shadow-md' 
                               : 'bg-white border border-brand-gold/10 text-[#2B2620] hover:bg-brand-gold/5'
                           }`}
                         >
                           {mode}
                         </button>
                       ))}
                     </div>
                   </div>

                   {paymentMode !== 'Cash' && (
                     <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">
                         {paymentMode === 'Cheque' ? 'Cheque No.' : 'Reference / Transaction ID'}
                       </label>
                       <input 
                         type="text" 
                         className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 text-sm font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/30"
                         placeholder="Enter reference details..."
                         value={paymentRef}
                         onChange={(e) => setPaymentRef(e.target.value)}
                       />
                     </div>
                   )}

                  <button 
                    onClick={handleRecordPayment}
                    className="w-full bg-brand-gold text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-brand-goldDark transition-all shadow-xl shadow-brand-gold/20 flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
                  >
                    Authorize Receipt <ArrowRightCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
           </div>
         )}
      </Modal>
    </div>
  )
}

export default PaymentGrid
