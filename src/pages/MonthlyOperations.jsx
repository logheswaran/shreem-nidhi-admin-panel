import React, { useEffect, useState } from 'react'
import { Calendar, PlayCircle, Trophy, IndianRupee, ArrowRight, Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { chitService } from '../services/chitService'
import { financeService } from '../services/financeService'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

const MonthlyOperations = () => {
  const [chits, setChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChit, setSelectedChit] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('') // 'generate', 'winner'
  const [processing, setProcessing] = useState(false)

  const fetchActiveChits = async () => {
    try {
      setLoading(true)
      const data = await chitService.getChits()
      setChits(data.filter(c => c.status === 'active'))
    } catch (error) {
      toast.error('Failed to load active schemes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveChits()
  }, [])

  const handleGenerateMonth = async () => {
    setProcessing(true)
    try {
      toast.loading('Generating contributions for new month...', { id: 'op' })
      await financeService.createMonthContributions(selectedChit.id)
      toast.success('Successfully initialized next month cycle!', { id: 'op' })
      setIsModalOpen(false)
      fetchActiveChits()
    } catch (error) {
      toast.error(error.message || 'Operation failed', { id: 'op' })
    } finally {
      setProcessing(false)
    }
  }

  const handleSelectWinner = async () => {
    setProcessing(true)
    try {
      toast.loading('Running Provably Fair winner selection...', { id: 'op' })
      await financeService.selectWinner(selectedChit.id)
      toast.success('Winner selected and ledger updated!', { id: 'op' })
      setIsModalOpen(false)
      fetchActiveChits()
    } catch (error) {
      toast.error(error.message || 'Winner selection failed', { id: 'op' })
    } finally {
      setProcessing(false)
    }
  }

  const columns = [
    { 
      header: 'Active Scheme', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full heritage-gradient flex items-center justify-center text-white shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-headline font-bold text-brand-navy">{row.name}</p>
            <p className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">Cycle: Month {row.current_month}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Monthly Entry', 
      render: (row) => <span className="font-bold text-brand-navy">₹{Number(row.monthly_contribution).toLocaleString()}</span> 
    },
    { 
      header: 'Selection Protocol', 
      render: (row) => <span className="text-xs font-medium capitalize">{row.chit_type} Selection</span> 
    },
    { 
      header: 'Operational Actions', 
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => { setSelectedChit(row); setModalType('generate'); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-goldDark text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-gold hover:text-white transition-all shadow-sm"
          >
            <PlayCircle className="w-4 h-4" /> Next Month
          </button>
          {row.chit_type === 'random' && (
            <button 
              onClick={() => { setSelectedChit(row); setModalType('winner'); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-navy-light transition-all shadow-sm"
            >
              <Trophy className="w-4 h-4 text-brand-gold" /> Select Winner
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-headline font-bold text-brand-navy">Monthly Operations</h2>
        <p className="text-on-surface-variant font-body mt-2 opacity-70">Execute cycle increments and financial distribution rituals.</p>
      </header>

      {/* Warning Panel */}
      <div className="mb-10 bg-brand-gold/5 border-l-4 border-brand-gold p-6 rounded-r-3xl flex gap-6 items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
          <AlertCircle className="text-brand-gold w-6 h-6" />
        </div>
        <div>
          <h4 className="font-headline font-bold text-brand-navy">Immutable Financial Protocol</h4>
          <p className="text-sm text-brand-text/60 mt-1">Actions taken here are recorded directly to the immutable ledger. Ensure month generation is performed only after verifying the previous cycle's adherence.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={chits} 
        loading={loading} 
        onRowClick={(row) => setSelectedChit(row)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'generate' ? "Commence Next Cycle" : "Selection Protocol"}
      >
        {selectedChit && (
          <div className="space-y-8">
            <div className="p-8 bg-brand-ivory rounded-[2.5rem] border border-brand-gold/10">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 heritage-gradient rounded-2xl flex items-center justify-center text-white"><IndianRupee className="w-6 h-6" /></div>
                  <div>
                    <h5 className="font-headline font-bold text-xl text-brand-navy tracking-tight">{selectedChit.name}</h5>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">Current: Month {selectedChit.current_month}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/50 p-4 rounded-2xl border border-brand-gold/5 shadow-sm">
                    <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-1">Impact</p>
                    <p className="text-sm font-bold text-brand-navy">{modalType === 'generate' ? 'Generate 20 records' : 'Update 1 Laureate'}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-brand-gold/5 shadow-sm">
                    <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-1">Ledger</p>
                    <p className="text-sm font-bold text-brand-navy">Write Required</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-4">
               <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
                  <Info className="text-blue-600 w-5 h-5 shrink-0" />
                  <p className="text-xs text-blue-800 leading-relaxed italic">
                    {modalType === 'generate' 
                      ? "This will instantiate contribution records for ALL active members in this scheme for Month " + (selectedChit.current_month + 1) + ". This operation cannot be reversed."
                      : "The Provably Fair algorithm will select one eligible member from the pool. Automated loan settlement and commission deduction will follow."}
                  </p>
               </div>

               <button 
                 disabled={processing}
                 onClick={modalType === 'generate' ? handleGenerateMonth : handleSelectWinner}
                 className="w-full heritage-gradient text-white py-5 rounded-full font-bold text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
               >
                 {processing ? (
                   <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <>
                     {modalType === 'generate' ? 'Execute Cycle Increment' : 'Authorize Selection Protocol'}
                     <CheckCircle2 className="w-5 h-5" />
                   </>
                 )}
               </button>
               
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="w-full py-4 text-brand-text/30 text-[10px] font-black uppercase tracking-widest hover:text-brand-gold transition-colors"
               >
                 Cancel Operation
               </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MonthlyOperations
