import React, { useEffect, useState } from 'react'
import { Plus, Coins, Users, Calendar, ArrowRight, Filter, Search } from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { chitService } from '../services/chitService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Chits = () => {
  const [chits, setChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newChit, setNewChit] = useState({
    name: '',
    chit_type: 'random',
    total_months: 20,
    max_members: 20,
    monthly_contribution: '',
    commission_rate: 5,
    status: 'forming'
  })
  
  const navigate = useNavigate()

  const fetchChits = async () => {
    try {
      setLoading(true)
      const data = await chitService.getChits()
      setChits(data)
    } catch (error) {
      toast.error('Failed to load chits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChits()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await chitService.createChit(newChit)
      toast.success('New chit scheme inaugurated!')
      setIsModalOpen(false)
      fetchChits()
    } catch (error) {
      toast.error(error.message || 'Creation failed')
    }
  }

  const columns = [
    { 
      header: 'Scheme Name', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
            <Coins className="text-brand-gold w-5 h-5" />
          </div>
          <div>
            <p className="font-headline font-bold text-brand-navy">{row.name}</p>
            <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest">{row.chit_type} selection</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Commitment', 
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy">₹{Number(row.monthly_contribution).toLocaleString()}</span>
          <span className="text-[10px] text-brand-text/30 block font-bold uppercase tracking-widest">per month</span>
        </div>
      ) 
    },
    { 
      header: 'Duration', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-brand-gold/40" />
          <span className="text-xs font-medium">{row.total_months} Months</span>
        </div>
      )
    },
    { 
      header: 'Occupancy', 
      render: (row) => (
        <div className="flex flex-col gap-1 w-24">
          <div className="flex justify-between text-[10px] font-bold text-brand-text/50">
            <span>{row.max_members} Cap</span>
          </div>
          <div className="h-1.5 w-full bg-brand-ivory rounded-full overflow-hidden border border-brand-gold/5">
            <div className="h-full heritage-gradient" style={{ width: '40%' }}></div>
          </div>
        </div>
      )
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Entry', 
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/chits/${row.id}`); }}
          className="p-2 hover:bg-brand-gold/10 rounded-full transition-all text-brand-gold"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Chits Management</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Monitor and orchestrate SreemNidhi savings collectives.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="heritage-gradient text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-xl flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Chit
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 flex items-center justify-center"><Coins className="text-brand-gold w-6 h-6"/></div>
           <div>
             <p className="text-2xl font-headline font-bold text-brand-navy leading-none">{chits.length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-1">Total Schemes</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center"><Calendar className="text-green-600 w-6 h-6"/></div>
           <div>
             <p className="text-2xl font-headline font-bold text-brand-navy leading-none">{chits.filter(c => c.status === 'active').length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-1">Live Cycles</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center"><Users className="text-blue-600 w-6 h-6"/></div>
           <div>
             <p className="text-2xl font-headline font-bold text-brand-navy leading-none">{chits.filter(c => c.status === 'forming').length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-1">In Formation</p>
           </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={chits} 
        loading={loading} 
        onRowClick={(row) => navigate(`/chits/${row.id}`)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Inaugurate New Scheme"
      >
        <form onSubmit={handleCreate} className="space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 ml-1">Scheme Title</label>
                <input 
                  required
                  className="w-full bg-brand-ivory border-2 border-brand-gold/10 rounded-2xl p-4 text-sm font-body focus:border-brand-gold focus:ring-0 transition-all shadow-inner"
                  placeholder="e.g. Platinum 10L Trust"
                  value={newChit.name}
                  onChange={(e) => setNewChit({...newChit, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 ml-1">Chit Type</label>
                <select 
                  className="w-full bg-brand-ivory border-2 border-brand-gold/10 rounded-2xl p-4 text-sm font-body focus:border-brand-gold focus:ring-0 transition-all"
                  value={newChit.chit_type}
                  onChange={(e) => setNewChit({...newChit, chit_type: e.target.value})}
                >
                  <option value="random">Random Selection</option>
                  <option value="auction">Traditional Auction</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 ml-1">Monthly Entry (₹)</label>
                <input 
                  required
                  type="number"
                  className="w-full bg-brand-ivory border-2 border-brand-gold/10 rounded-2xl p-4 text-sm font-body focus:border-brand-gold focus:ring-0 transition-all shadow-inner"
                  placeholder="5000"
                  value={newChit.monthly_contribution}
                  onChange={(e) => setNewChit({...newChit, monthly_contribution: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 ml-1">Total Months</label>
                <input 
                  required
                  type="number"
                  className="w-full bg-brand-ivory border-2 border-brand-gold/10 rounded-2xl p-4 text-sm font-body focus:border-brand-gold focus:ring-0 transition-all shadow-inner"
                  value={newChit.total_months}
                  onChange={(e) => setNewChit({...newChit, total_months: Number(e.target.value), max_members: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 ml-1">Comm. Rate (%)</label>
                <input 
                  required
                  type="number"
                  step="0.5"
                  className="w-full bg-brand-ivory border-2 border-brand-gold/10 rounded-2xl p-4 text-sm font-body focus:border-brand-gold focus:ring-0 transition-all shadow-inner"
                  value={newChit.commission_rate}
                  onChange={(e) => setNewChit({...newChit, commission_rate: Number(e.target.value)})}
                />
              </div>
           </div>
           
           <button 
             type="submit"
             className="w-full heritage-gradient text-white py-5 rounded-full font-bold text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
           >
             Initialize Collective
           </button>
        </form>
      </Modal>
    </div>
  )
}

export default Chits
