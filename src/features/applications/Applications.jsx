import React, { useEffect, useState } from 'react'
import { Check, X, ShieldCheck, Calendar, Phone, Info, ArrowUpRight } from 'lucide-react'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'
import { memberService } from '../members/api'
import toast from 'react-hot-toast'

const Applications = () => {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchApps = async () => {
    try {
      setLoading(true)
      const data = await memberService.getApplications()
      setApps(data)
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const handleApprove = async () => {
    try {
      toast.loading('Processing approval...', { id: 'approve' })
      await memberService.approveApplication(selectedApp.id)
      toast.success('Member application approved!', { id: 'approve' })
      setIsModalOpen(false)
      fetchApps()
    } catch (error) {
      toast.error(error.message || 'Approval failed', { id: 'approve' })
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error('Please provide a reason for rejection')
      return
    }
    try {
      toast.loading('Processing rejection...', { id: 'reject' })
      await memberService.rejectApplication(selectedApp.id, rejectionReason)
      toast.success('Application rejected', { id: 'reject' })
      setIsModalOpen(false)
      fetchApps()
    } catch (error) {
      toast.error(error.message || 'Rejection failed', { id: 'reject' })
    }
  }

  const columns = [
    { 
      header: 'Candidate', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full heritage-gradient flex items-center justify-center text-white font-bold shadow-sm">
            {row.profiles?.full_name?.[0] || 'A'}
          </div>
          <div>
            <p className="font-bold text-brand-navy leading-snug">{row.profiles?.full_name}</p>
            <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest">{row.profiles?.phone_number}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Scheme Selection', 
      render: (row) => (
        <div>
          <span className="font-headline font-bold text-brand-gold block">{row.chits?.name}</span>
          <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">Entry: ₹{Number(row.chits?.monthly_contribution).toLocaleString()}</span>
        </div>
      ) 
    },
    { header: 'Submission Date', render: (row) => <span className="text-xs font-medium text-brand-text/60">{new Date(row.applied_at).toLocaleDateString()}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Action', 
      render: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedApp(row);
            setIsModalOpen(true);
          }}
          className="bg-brand-gold hover:bg-brand-goldDark text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all shadow-md active:scale-95"
        >
          {row.status === 'pending' ? 'Review' : 'View Details'}
        </button>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Member Applications</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Review and authorize entry into SreemNidhi collectives.</p>
        </div>
        <div className="flex gap-2">
           <span className="flex items-center gap-2 px-4 py-2 bg-brand-gold/5 border border-brand-gold/10 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-goldDark">
             {apps.filter(a => a.status === 'pending').length} Pending Review
           </span>
        </div>
      </header>

      <DataTable 
        columns={columns} 
        data={apps} 
        loading={loading} 
        onRowClick={(row) => {
          setSelectedApp(row);
          setIsModalOpen(true);
        }}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Institutional Review"
        maxWidth="max-w-3xl"
      >
        {selectedApp && (
          <div className="space-y-10">
            {/* Header Info */}
            <div className="flex items-center gap-6 p-8 bg-brand-ivory/50 rounded-[2.5rem] border border-brand-gold/10 shadow-sm">
              <div className="w-16 h-16 rounded-full heritage-gradient flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {selectedApp.profiles?.full_name?.[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-headline font-bold text-brand-navy leading-none">{selectedApp.profiles?.full_name}</h4>
                <div className="flex gap-6 mt-3">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-text/40"><Phone className="w-3.5 h-3.5 text-brand-gold"/> {selectedApp.profiles?.phone_number}</span>
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-text/40"><Calendar className="w-3.5 h-3.5 text-brand-gold"/> {new Date(selectedApp.applied_at).toLocaleDateString()}</span>
                </div>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {/* Profile Summary */}
            <div className="grid grid-cols-2 gap-8 px-2">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60 ml-1">Proposed Commitment</label>
                <div className="p-6 bg-white rounded-3xl border border-brand-gold/5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30 mb-1 leading-none">Scheme Title</p>
                  <p className="text-xl font-headline font-bold text-brand-navy">{selectedApp.chits?.name}</p>
                  <div className="mt-4 flex items-center gap-2 text-brand-gold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-bold">Contribution: ₹{Number(selectedApp.chits?.monthly_contribution).toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60 ml-1">Compliance Status</label>
                <div className="p-6 bg-white rounded-3xl border border-brand-gold/5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                    <ShieldCheck className="text-green-600 w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Verified Candidate</p>
                    <p className="text-[10px] text-brand-navy font-bold mt-1 opacity-40">Identity proof fully audited</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedApp.status === 'pending' ? (
              <div className="space-y-8 pt-8 px-2 border-t border-dashed border-brand-gold/20">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/30 ml-1">Underwriting Review / Rejection Reason</label>
                  <textarea 
                    className="w-full bg-white border border-brand-gold/10 rounded-3xl p-6 text-sm font-body focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none placeholder:italic transition-all shadow-inner"
                    placeholder="Enter notes for rejection or internal audit..."
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleReject}
                    className="flex-1 py-5 border-2 border-brand-gold/10 text-brand-text/40 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2 group"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Reject Admission
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="flex-[2] py-5 heritage-gradient text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Execute Admission
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-brand-navy/5 rounded-3xl flex gap-6 items-start border border-brand-gold/5 mx-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Info className="text-brand-gold w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-headline font-bold text-brand-navy uppercase tracking-tight">Post-Review Log</p>
                  <p className="text-xs text-brand-text/60 mt-2 leading-relaxed">
                    This candidate was processed by the <span className="font-bold text-brand-gold">Security Protocol</span>. 
                    Authorization recorded on <span className="bg-white px-2 py-0.5 rounded-full font-bold shadow-sm">{new Date(selectedApp.reviewed_at).toLocaleString()}</span>. 
                    Record is now immutable.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Applications
