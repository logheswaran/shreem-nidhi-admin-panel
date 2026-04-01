import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Coins, 
  Settings, 
  UserPlus, 
  PlayCircle, 
  Gavel, 
  CheckCircle2, 
  TrendingUp,
  Landmark
} from 'lucide-react'
import { chitService } from './api'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import toast from 'react-hot-toast'

const ChitDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [chit, setChit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')

  const fetchChit = async () => {
    try {
      setLoading(true)
      const data = await chitService.getChitById(id)
      setChit(data)
    } catch (error) {
      toast.error('Failed to load scheme details')
      navigate('/chits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChit()
  }, [id])

  if (loading) return <div className="h-96 flex flex-col items-center justify-center font-headline"><div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-brand-gold animate-pulse">Consulting Registry...</p></div>
  if (!chit) return null

  const memberColumns = [
    { 
      header: 'Beneficiary', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center font-bold text-sm text-brand-gold border border-brand-gold/10 group-hover:bg-white transition-all">
            {row.profiles?.full_name?.[0] || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy">{row.profiles?.full_name}</span>
            <span className="text-[10px] text-brand-text/30 font-bold tracking-tight uppercase">{row.profiles?.phone_number}</span>
          </div>
        </div>
      )
    },
    { header: 'Entry Date', render: (row) => <span className="text-xs font-medium text-brand-text/60">{new Date(row.joined_at).toLocaleDateString()}</span> },
    { header: 'Admittance', render: (row) => <span className="text-xs font-bold text-brand-navy">{row.is_winner ? '🏆 Laureate' : 'Eligible Participant'}</span> },
    { header: 'Audit Status', render: (row) => <StatusBadge status={row.status} /> }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/chits')}
        className="mb-8 flex items-center gap-2 text-brand-text/40 hover:text-brand-gold transition-colors group text-[10px] font-black uppercase tracking-[0.2em]"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Return to Registry
      </button>

      {/* Header Profile */}
      <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-white p-12 rounded-[3.5rem] border border-brand-gold/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <Landmark className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="flex items-center gap-10 z-10">
          <div className="w-28 h-28 rounded-[2.5rem] heritage-gradient flex items-center justify-center shadow-2xl border-4 border-white transform rotate-3">
             <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                <Coins className="text-white w-10 h-10" />
             </div>
          </div>
          <div>
            <div className="flex items-center gap-5 mb-3">
              <h2 className="text-5xl font-headline font-bold text-brand-navy tracking-tight">{chit.name}</h2>
              <StatusBadge status={chit.status} />
            </div>
            <p className="text-on-surface-variant font-body opacity-60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
              Orchestrated on {new Date(chit.created_at).toLocaleDateString()} • Exclusive {chit.chit_type} selection protocol
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 z-10">
          {chit.status === 'forming' && (
            <button className="px-10 py-4 heritage-gradient text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3">
              <PlayCircle className="w-5 h-5" />
              Activate Scheme
            </button>
          )}
          {chit.chit_type === 'auction' && chit.status === 'active' && (
            <button className="px-10 py-4 bg-brand-navy text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-brand-navy-light active:scale-[0.98] transition-all flex items-center gap-3">
              <Gavel className="w-5 h-5 text-brand-gold" />
              Commence Auction
            </button>
          )}
          <button className="p-4 bg-brand-ivory text-brand-gold rounded-full border border-brand-gold/10 hover:bg-brand-gold/20 transition-all shadow-sm">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col shadow-sm transition-all hover:scale-105 duration-300">
          <Users className="w-6 h-6 text-brand-gold mb-4" />
          <span className="text-3xl font-headline font-bold text-brand-navy leading-none">{chit.chit_members?.length || 0} / {chit.max_members}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/30 mt-3 italic leading-none">Trust Participation</span>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col shadow-sm transition-all hover:scale-105 duration-300">
          <Calendar className="w-6 h-6 text-brand-gold mb-4" />
          <span className="text-3xl font-headline font-bold text-brand-navy leading-none">{chit.current_month} / {chit.total_months}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/30 mt-3 italic leading-none">Subscription Cycle</span>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col shadow-sm transition-all hover:scale-105 duration-300">
          <TrendingUp className="w-6 h-6 text-brand-gold mb-4" />
          <span className="text-3xl font-headline font-bold text-brand-navy leading-none">₹{Number(chit.monthly_contribution).toLocaleString()}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/30 mt-3 italic leading-none">Premium Installment</span>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col shadow-sm transition-all hover:scale-105 duration-300">
          <CheckCircle2 className="text-green-600 w-6 h-6 mb-4" />
          <span className="text-3xl font-headline font-bold text-brand-navy leading-none">₹{(Number(chit.monthly_contribution) * (chit.total_months - 1)).toLocaleString()}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/30 mt-3 italic leading-none">Estimated Maturation</span>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="space-y-8">
        <div className="flex gap-12 border-b-2 border-brand-gold/5 px-4 overflow-x-auto no-scrollbar">
          {['members', 'contributions', 'auction rounds', 'audit ledger'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative whitespace-nowrap min-w-max ${
                activeTab === tab ? 'text-brand-navy' : 'text-brand-text/30 hover:text-brand-text/60'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-[-2px] left-0 w-full h-1 heritage-gradient rounded-full shadow-lg shadow-brand-gold/30"></div>}
            </button>
          ))}
        </div>

        <div className="p-2">
          {activeTab === 'members' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center px-10 pt-4">
                <div className="flex flex-col">
                   <h4 className="font-headline font-bold text-2xl text-brand-navy">Authorized Beneficiaries</h4>
                   <p className="text-xs text-on-surface-variant font-medium opacity-50">Members strictly admitted via underwriting protocol.</p>
                </div>
                <button className="flex items-center gap-3 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-brand-goldDark transition-all shadow-xl active:scale-95">
                  <UserPlus className="w-4 h-4" /> Add Participant
                </button>
              </div>
              <DataTable columns={memberColumns} data={chit.chit_members || []} />
            </div>
          )}
          {activeTab !== 'members' && (
            <div className="py-40 bg-white rounded-[3rem] border border-brand-gold/5 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-brand-ivory rounded-full flex items-center justify-center mb-6 shadow-inner border border-brand-gold/5">
                <span className="material-symbols-outlined text-5xl text-brand-gold opacity-20">history_edu</span>
              </div>
              <p className="font-headline text-2xl text-brand-navy font-bold leading-none">Consulting Historical Records</p>
              <p className="text-xs text-brand-text/40 font-bold uppercase tracking-widest mt-4 animate-pulse">Synchronizing with Secure Ledger...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChitDetails
