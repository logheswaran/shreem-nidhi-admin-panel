import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserCircle, Phone, Mail, MapPin, Calendar, Wallet, FileText, ArrowUpRight } from 'lucide-react'
import { memberService } from './api'
import { financeService } from '../finance/api'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import toast from 'react-hot-toast'

const MemberProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true)
        const allMembers = await memberService.getMembers()
        const found = allMembers.find(m => m.id === id)
        
        if (!found) {
          toast.error('Beneficiary not found')
          navigate('/members')
          return
        }

        setMember(found)

        // Filtering transitions specifically for this member based on user_id
        const allLedger = await financeService.getLedger()
        const memberLedger = allLedger.filter(l => l.user_id === found.user_id)
        setTransactions(memberLedger)
      } catch (error) {
        toast.error('Audit failed to retrieve profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchMemberData()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!member) return null

  const ledgerColumns = [
    { 
      header: 'Date', 
      render: (row) => <span className="text-xs font-bold font-body">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    { 
      header: 'Type', 
      render: (row) => <span className="capitalize text-xs font-medium text-brand-text/60">{row.reference_type.replace('_', ' ')}</span>
    },
    { 
      header: 'Amount', 
      render: (row) => <span className={`font-bold ${row.transaction_type === 'debit' ? 'text-red-500' : 'text-green-600'}`}>₹{Number(row.amount).toLocaleString()}</span>
    },
    { header: 'Status', render: () => <StatusBadge status="paid" /> }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <button 
        onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/40 dark:text-[#A89F8C] hover:text-brand-gold transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Registry
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Identity Card */}
        <div className="lg:col-span-1 border border-brand-gold/10 bg-white dark:bg-[#16213E] shadow-sm p-8 rounded-[2.5rem] flex flex-col items-center text-center soft-glow h-fit">
          <div className="w-32 h-32 rounded-full bg-brand-ivory dark:bg-[#12122A] border-4 border-white dark:border-[#16213E] shadow-2xl flex items-center justify-center mb-6 relative group overflow-hidden">
            {member.profiles?.full_name ? (
              <span className="text-5xl font-black text-brand-gold font-headline tracking-tighter">
                {member.profiles.full_name[0]}
              </span>
            ) : (
              <UserCircle className="w-16 h-16 text-brand-gold/30" />
            )}
            <div className="absolute inset-0 heritage-gradient opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <span className="text-[10px] text-white font-black uppercase tracking-widest leading-tight">View<br/>KYC</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-headline font-bold text-brand-navy dark:text-[#F0EDD4] leading-tight">{member.profiles?.full_name}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mt-2 bg-brand-gold/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></div> Active Delegate
          </p>
          
          <div className="w-full h-px bg-brand-gold/10 my-8"></div>

          <div className="w-full space-y-6 text-left">
             <div className="flex items-center gap-4 group">
               <div className="w-10 h-10 rounded-2xl bg-brand-ivory dark:bg-[#12122A] flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors border border-brand-gold/10">
                 <Phone className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-text/30 dark:text-[#6B6458]">Primary Contact</p>
                 <p className="font-bold text-brand-navy dark:text-[#F0EDD4] text-sm mt-0.5">{member.profiles?.mobile_number || 'N/A'}</p>
               </div>
             </div>

             <div className="flex items-center gap-4 group">
               <div className="w-10 h-10 rounded-2xl bg-brand-ivory dark:bg-[#12122A] flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors border border-brand-gold/10">
                 <Mail className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-text/30 dark:text-[#6B6458]">Digital Mailbox</p>
                 <p className="font-bold text-brand-navy dark:text-[#F0EDD4] text-sm mt-0.5">{member.profiles?.email || 'N/A'}</p>
               </div>
             </div>

             <div className="flex items-center gap-4 group">
               <div className="w-10 h-10 rounded-2xl bg-brand-ivory dark:bg-[#12122A] flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors border border-brand-gold/10">
                 <Calendar className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-text/30 dark:text-[#6B6458]">Registration Date</p>
                 <p className="font-bold text-brand-navy dark:text-[#F0EDD4] text-sm mt-0.5">{member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Portfolio & Ledger */}
        <div className="lg:col-span-2 flex flex-col gap-8">
           {/* Summary Cards */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-brand-ivory/50 dark:bg-[#16213E] rounded-[2rem] p-6 border border-brand-gold/10 hover:bg-white dark:hover:bg-[#1a2b4e] transition-colors group cursor-default">
                 <Wallet className="w-6 h-6 text-brand-gold mb-4 stroke-[1.5]" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-text/40 dark:text-[#A89F8C] mb-1">Total Assets</h4>
                 <p className="text-2xl font-headline font-bold text-brand-navy dark:text-[#F0EDD4] group-hover:text-brand-gold transition-colors">
                   ₹{transactions.filter(t => t.transaction_type === 'credit').reduce((s,t) => s + Number(t.amount), 0).toLocaleString()}
                 </p>
              </div>
              <div className="bg-brand-ivory/50 rounded-[2rem] p-6 border border-brand-gold/10 hover:bg-white transition-colors group cursor-default">
                 <ArrowUpRight className="w-6 h-6 text-red-400 mb-4 stroke-[1.5]" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-text/40 mb-1">Credit Exposure</h4>
                 <p className="text-2xl font-headline font-bold text-red-600 transition-colors">₹0</p>
              </div>
              <div className="bg-brand-navy rounded-[2rem] p-6 text-white text-center flex flex-col justify-center items-center relative overflow-hidden group hover:brightness-110 transition-all cursor-pointer">
                 <div className="absolute inset-0 opacity-10 heritage-gradient"></div>
                 <FileText className="w-6 h-6 text-brand-gold mb-3 z-10" />
                 <span className="text-[10px] font-black uppercase tracking-widest z-10">Export Profile<br/>Dossier</span>
              </div>
           </div>

           {/* Personal Ledger */}
           <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-col soft-glow">
             <div className="p-8 border-b border-brand-gold/5 flex justify-between items-center bg-surface-container/20">
               <div>
                  <h3 className="font-headline text-2xl font-bold text-brand-navy">Personal Ledger</h3>
                  <p className="text-xs font-medium text-brand-text/40 mt-1 uppercase tracking-widest font-body">Transaction History</p>
               </div>
               <StatusBadge status={member.status} />
             </div>
             <DataTable columns={ledgerColumns} data={transactions} pageSize={5} />
           </div>
        </div>
      </div>
    </div>
  )
}

export default MemberProfile
