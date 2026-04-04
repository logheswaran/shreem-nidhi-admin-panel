import React, { useEffect, useState } from 'react'
import { Landmark, IndianRupee, Plus, Users, ArrowUpRight, CheckCircle2, Info, Landmark as BankIcon } from 'lucide-react'
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
      header: 'Action', 
      render: (row) => row.status === 'active' && (
        <button 
          onClick={() => openRepayModal(row)}
          className="bg-[#2B2620] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <IndianRupee className="w-3 h-3" /> Execute Repayment
        </button>
      )
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
    </div>
  )
}

export default Loans
