import React, { useEffect, useState } from 'react'
import { Calendar, PlayCircle, Trophy, IndianRupee, ArrowRight, Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { chitService } from '../chits/api'
import { financeService } from './api'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'
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

      <ConfirmDialog 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalType === 'generate' ? handleGenerateMonth : handleSelectWinner}
        title={modalType === 'generate' ? "Commence Next Cycle" : "Selection Protocol"}
        message={
          modalType === 'generate' 
            ? `This will instantiate contribution records for ALL active members in ${selectedChit?.name} for Month ${selectedChit?.current_month + 1}. This operation cannot be reversed.`
            : `The Provably Fair algorithm will select one eligible member from ${selectedChit?.name}. Automated loan settlement and commission deduction will follow.`
        }
        intent="brand"
        confirmText={modalType === 'generate' ? 'Execute Cycle ' + (selectedChit?.current_month + 1) : 'Authorize Selection'}
        loading={processing}
      />
    </div>
  )
}

export default MonthlyOperations
