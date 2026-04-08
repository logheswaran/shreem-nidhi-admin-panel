import React, { useEffect, useState } from 'react'
import { Landmark, IndianRupee, Plus, Users, ArrowUpRight, CheckCircle2, Info, Landmark as BankIcon, XCircle, AlertTriangle } from 'lucide-react'
import { financeService } from './api'
import { memberService } from '../members/api'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'
import toast from 'react-hot-toast'

const Loans = () => {
  const [loans, setLoans] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  const [newLoan, setNewLoan] = useState({ memberId: '', amount: '' })
  const [repayData, setRepayData] = useState({ loanId: null, amount: '', max: 0 })
  const [processing, setProcessing] = useState(false)
  
  // Close/Write-off modal state
  const [closeModal, setCloseModal] = useState({ open: false, type: null, loan: null, reason: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [loanData, memberData] = await Promise.all([
        financeService.getLoans(),
        memberService.getMembers()
      ])
      setLoans(loanData)
      setMembers(memberData)
    } catch (error) {
      toast.error('Failed to load credit systems')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleIssueLoan = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      toast.loading('Authorizing loan issuance...', { id: 'loan' })
      await financeService.issueLoan(newLoan.memberId, newLoan.amount)
      toast.success('Funds disbursed and ledger updated!', { id: 'loan' })
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Loan issuance failed. Capacity exceeded?', { id: 'loan' })
    } finally {
      setProcessing(false)
    }
  }

  const openRepayModal = (loan) => {
    setRepayData({ loanId: loan.id, amount: '', max: Number(loan.balance) })
    setIsRepayModalOpen(true)
  }

  const handleRepay = async (e) => {
    e.preventDefault()
    if (!repayData.amount || Number(repayData.amount) <= 0) return
    if (Number(repayData.amount) > repayData.max) {
      toast.error('Cannot repay more than the current balance')
      return
    }

    setProcessing(true)
    try {
      toast.loading('Processing repayment audit...', { id: 'loan' })
      await financeService.repayLoan(repayData.loanId, Number(repayData.amount))
      toast.success('Asset retrieved and treasury updated!', { id: 'loan' })
      setIsRepayModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Repayment failed', { id: 'loan' })
    } finally {
      setProcessing(false)
    }
  }

  const handleCloseOrWriteOff = async () => {
    const { type, loan, reason } = closeModal
    setProcessing(true)
    try {
      if (type === 'close') {
        toast.loading('Closing loan account...', { id: 'loan-close' })
        await financeService.closeLoan(loan.id, reason || 'manual_closure')
        toast.success('Loan closed successfully!', { id: 'loan-close' })
      } else {
        toast.loading('Processing write-off...', { id: 'loan-close' })
        await financeService.writeOffLoan(loan.id, reason)
        toast.success('Loan written off and recorded!', { id: 'loan-close' })
      }
      setCloseModal({ open: false, type: null, loan: null, reason: '' })
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Operation failed', { id: 'loan-close' })
    } finally {
      setProcessing(false)
    }
  }

  const columns = [
    { 
      header: 'Beneficiary Trust', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-gold/5 flex items-center justify-center font-bold text-sm text-brand-gold border border-brand-gold/10 shadow-inner">
            {row.chit_members?.profiles?.full_name?.[0] || 'T'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#2B2620] group-hover:text-brand-gold transition-colors">{row.chit_members?.profiles?.full_name || 'System Protocol'}</span>
            <span className="text-[10px] text-brand-text/30 font-bold tracking-widest uppercase">Member ID: {row.member_id.slice(0, 6).toUpperCase()}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Loan Details', 
      render: (row) => (
        <div>
          <span className="font-bold text-[#2B2620] block leading-none mb-1">₹{Number(row.amount).toLocaleString()} Capital</span>
          <span className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest italic">{row.interest_rate}% APR applied</span>
        </div>
      )
    },
    { 
      header: 'Exposure', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-black text-[#2B2620] leading-none mb-1">₹{Number(row.balance).toLocaleString()}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#2B2620]/40">Current Liability</span>
        </div>
      ) 
    },
    { header: 'Admittance', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      render: (row) => {
        if (row.status === 'closed') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Closed</span>
        }
        if (row.status === 'written_off') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">Written Off</span>
        }
        if (row.status === 'active') {
          return (
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => openRepayModal(row)}
                className="bg-[#2B2620] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                <IndianRupee className="w-3 h-3" /> Repay
              </button>
              {Number(row.balance) === 0 ? (
                <button 
                  onClick={() => setCloseModal({ open: true, type: 'close', loan: row, reason: '' })}
                  className="bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-green-700 transition-all shadow-md active:scale-95 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Close
                </button>
              ) : (
                <button 
                  onClick={() => setCloseModal({ open: true, type: 'writeoff', loan: row, reason: '' })}
                  className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-red-600 transition-all shadow-md active:scale-95 flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" /> Write Off
                </button>
              )}
            </div>
          )
        }
        return null
      }
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Credit Authorization</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Monitor scheme liquidity and authorize liquidity disbursement.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="heritage-gradient text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Authorize New Credit
        </button>
      </header>

      {/* Credit Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-gold/5 flex items-center gap-5 shadow-sm transform hover:-translate-y-1 transition-all">
           <div className="w-14 h-14 rounded-2xl bg-brand-gold/5 flex items-center justify-center shadow-inner"><BankIcon className="text-brand-gold w-7 h-7"/></div>
           <div>
             <p className="text-2xl font-headline font-bold text-[#2B2620] leading-none">₹{loans.reduce((s,l) => s + (l.status === 'active' ? Number(l.balance) : 0), 0).toLocaleString()}</p>
             <p className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-gold/60 mt-2">Active Asset Exposure</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-gold/5 flex items-center gap-5 shadow-sm transform hover:-translate-y-1 transition-all">
           <div className="w-14 h-14 rounded-2xl bg-brand-gold/5 flex items-center justify-center shadow-inner"><Users className="text-brand-gold w-7 h-7"/></div>
           <div>
             <p className="text-2xl font-headline font-bold text-[#2B2620] leading-none">{loans.filter(l => l.status === 'active').length}</p>
             <p className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-gold/60 mt-2">Circulating Accounts</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-gold/5 flex items-center gap-5 shadow-sm transform hover:-translate-y-1 transition-all">
           <div className="w-14 h-14 rounded-2xl bg-brand-gold/5 flex items-center justify-center shadow-inner"><CheckCircle2 className="text-brand-gold w-7 h-7"/></div>
           <div>
             <p className="text-2xl font-headline font-bold text-[#2B2620] leading-none">{loans.filter(l => l.status === 'closed').length}</p>
             <p className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-gold/60 mt-2">Retrieved Capitals</p>
           </div>
        </div>
      </div>

      <DataTable columns={columns} data={loans} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Underwriting Authorization">
        <form onSubmit={handleIssueLoan} className="space-y-10">
           <div className="p-10 bg-brand-ivory rounded-[3rem] border border-brand-gold/10 shadow-inner">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Beneficiary Delegate Selection</label>
                  <select 
                    required
                    className="w-full bg-white border-2 border-brand-gold/5 rounded-3xl p-5 text-sm font-body font-bold text-[#2B2620] focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/40 focus:outline-none transition-all shadow-sm"
                    value={newLoan.memberId}
                    onChange={(e) => setNewLoan({...newLoan, memberId: e.target.value})}
                  >
                    <option value="">Select established member...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.profiles?.full_name} — {m.chits?.name || 'Unassigned'}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Principal Capital Injection (₹)</label>
                  <input 
                    required
                    type="number"
                    className="w-full bg-white border-2 border-brand-gold/5 rounded-3xl p-5 text-lg font-headline font-bold text-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/40 focus:outline-none transition-all shadow-sm placeholder:text-brand-text/10"
                    placeholder="Enter issuance amount..."
                    value={newLoan.amount}
                    onChange={(e) => setNewLoan({...newLoan, amount: e.target.value})}
                  />
                </div>
              </div>
           </div>

           <div className="bg-[#2B2620]/5 p-8 rounded-[2.5rem] border border-[#2B2620]/5 flex gap-5 items-start">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#2B2620]/5">
                <Info className="text-brand-gold w-5 h-5 flex items-center" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#2B2620] mb-1 leading-none">Authorization Protocol</p>
               <p className="text-xs text-brand-text/60 leading-relaxed italic mt-2">
                 Capital disbursement is capped at <span className="font-bold text-brand-gold">70% of accumulated trust holdings</span>. 
                 Approval will trigger an immediate debit entry in the <span className="font-bold">Institutional Ledger</span>.
               </p>
             </div>
           </div>

           <button 
             disabled={processing}
             type="submit"
             className="w-full heritage-gradient text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.25em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
           >
             {processing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div> : (
               <>
                 <ArrowUpRight className="w-5 h-5" />
                 Authorize Disbursement
               </>
             )}
           </button>
        </form>
      </Modal>

      {/* Repayment Modal */}
      <Modal isOpen={isRepayModalOpen} onClose={() => setIsRepayModalOpen(false)} title="Treasury Repayment">
        <form onSubmit={handleRepay} className="space-y-10">
           <div className="p-10 bg-brand-ivory rounded-[3rem] border border-brand-gold/10 shadow-inner">
              <div className="space-y-8">
                <div className="flex justify-between items-center text-sm font-bold text-[#2B2620] pb-4 border-b border-brand-gold/10">
                  <span>Current Exposure:</span>
                  <span className="text-[#2B2620] text-lg">₹{repayData.max.toLocaleString()}</span>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Repayment Amount (₹)</label>
                  <input 
                    required
                    type="number"
                    max={repayData.max}
                    className="w-full bg-white border-2 border-brand-gold/5 rounded-3xl p-5 text-lg font-headline font-bold text-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/40 focus:outline-none transition-all shadow-sm placeholder:text-brand-text/10"
                    placeholder="Enter amount to retrieve..."
                    value={repayData.amount}
                    onChange={(e) => setRepayData({...repayData, amount: e.target.value})}
                  />
                </div>
              </div>
           </div>

           <button 
             disabled={processing}
             type="submit"
             className="w-full bg-[#2B2620]/95 hover:bg-[#2B2620] text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.25em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
           >
             {processing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div> : (
               <>
                 <CheckCircle2 className="w-5 h-5" />
                 Confirm Repayment
               </>
             )}
           </button>
        </form>
      </Modal>

      {/* Close/Write-off Confirmation Modal */}
      {closeModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                closeModal.type === 'close' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  closeModal.type === 'close' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-[#2B2620]">
                  {closeModal.type === 'close' ? 'Close Loan Account' : 'Write Off Loan'}
                </h3>
                <p className="text-sm text-brand-text/50">
                  {closeModal.loan?.chit_members?.profiles?.full_name}
                </p>
              </div>
            </div>

            {closeModal.type === 'close' ? (
              <p className="text-sm text-brand-text/70 mb-6">
                This loan has a zero balance and can be closed. This action will mark the loan as completed and update the audit trail.
              </p>
            ) : (
              <>
                <div className="bg-red-50 p-4 rounded-2xl mb-4">
                  <p className="text-sm text-red-700 font-bold">
                    Outstanding Balance: ₹{Number(closeModal.loan?.balance || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This amount will be written off as a loss.
                  </p>
                </div>
                <p className="text-sm text-brand-text/70 mb-4">
                  Write-off is a financial decision that affects the books. Please provide a reason for compliance.
                </p>
                <textarea
                  placeholder="Reason for write-off (required)..."
                  className="w-full p-4 border border-brand-gold/20 rounded-2xl text-sm mb-4 focus:outline-none focus:border-brand-gold/50"
                  rows={3}
                  value={closeModal.reason}
                  onChange={(e) => setCloseModal({ ...closeModal, reason: e.target.value })}
                />
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCloseModal({ open: false, type: null, loan: null, reason: '' })}
                disabled={processing}
                className="flex-1 px-6 py-3 rounded-full border border-brand-gold/20 text-sm font-bold hover:bg-brand-gold/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseOrWriteOff}
                disabled={processing || (closeModal.type === 'writeoff' && !closeModal.reason.trim())}
                className={`flex-1 px-6 py-3 rounded-full text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  closeModal.type === 'close' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {closeModal.type === 'close' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {closeModal.type === 'close' ? 'Close Loan' : 'Confirm Write-Off'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Loans
