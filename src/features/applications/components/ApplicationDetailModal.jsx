import React, { useState } from 'react'
import { 
  X, Check, AlertCircle, ShieldCheck, 
  User, Phone, Mail, MapPin, 
  Briefcase, TrendingUp, FileText, 
  Clock, Info, ArrowRight, AlertTriangle,
  Eye, CheckCircle2
} from 'lucide-react'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import RiskBadge from '../../../shared/components/ui/RiskBadge'
import GlobalModal from '../../../shared/components/ui/GlobalModal'

/**
 * FEATURE: Application Detail Modal (Standardized Refactor)
 * Standardized using the central GlobalModal framework.
 */
const ApplicationDetailModal = ({ 
  isOpen, 
  onClose, 
  application, 
  onApprove, 
  onReject, 
  onRequestInfo,
  processing 
}) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [viewingDoc, setViewingDoc] = useState(null)

  if (!application) return null

  // Risk Logic
  const monthlyIncome = application.monthly_income || 0
  const monthlyCommitment = application.chits?.monthly_amount || 0
  const riskRatio = monthlyIncome > 0 ? (monthlyCommitment / monthlyIncome) * 100 : 0
  
  const isHighRisk = application.risk?.level === 'HIGH' || riskRatio > 40
  const riskReason = application.risk?.reason || (riskRatio > 40 ? "Monthly commitment exceeds 40% of income." : "")

  const handleAction = (type) => {
    if (type === 'approve' && isHighRisk && !showWarning) {
      setShowWarning(true)
      return
    }

    if (type === 'approve') onApprove(application.id)
    if (type === 'reject') onReject({ id: application.id, reason: rejectionReason })
    if (type === 'request') onRequestInfo({ id: application.id, message: infoMessage })
  }

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Admission Review"
      maxWidth="max-w-6xl"
    >
      <div className="flex flex-col">
        {/* Sub-header info */}
        <div className="flex items-center justify-between -mt-6 mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">
            Serial Reference: {application.id}
          </p>
          <StatusBadge status={application.status} />
        </div>

        {/* Scrollable Intelligence Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Identity & Profile */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-8 rounded-[2rem] border border-[#B6955E]/10 shadow-sm">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold/60 mb-6 block">Candidate Identity</label>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <User className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/30 leading-none mb-1">Legal Name</p>
                    <p className="text-base font-bold text-[#2B2620] leading-tight">{application.profiles?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/30 leading-none mb-1">Primary Mobile</p>
                    <p className="text-sm font-semibold text-[#2B2620]">{application.profiles?.mobile_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/30 leading-none mb-1">Digital Address</p>
                    <p className="text-sm font-semibold text-[#2B2620]">{application.profiles?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/30 leading-none mb-1">Residential Locus</p>
                    <p className="text-xs font-semibold text-[#2B2620] leading-relaxed">{application.profiles?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#2B2620] p-8 rounded-[2rem] text-white shadow-xl">
               <Briefcase className="w-6 h-6 text-brand-gold mb-4" />
               <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 block">Economic Profile</label>
               <p className="text-2xl font-headline font-bold mb-1">₹{Number(application.monthly_income).toLocaleString()}</p>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Certified Monthly Revenue</p>
            </section>
          </div>

          {/* Column 2: Selection & Risk */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-8 rounded-[2rem] border border-[#B6955E]/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <TrendingUp className="w-24 h-24 text-brand-gold" />
              </div>
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold/60 mb-6 block">Requested Endowment</label>
              <div>
                 <p className="text-2xl font-headline font-bold text-[#2B2620] leading-tight">{application.chits?.name}</p>
                 <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-[#B6955E]/5">
                       <span className="text-xs font-bold text-brand-text/40 tracking-tight">Monthly Subscription</span>
                       <span className="text-sm font-black text-brand-gold">₹{Number(application.chits?.monthly_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                       <span className="text-xs font-bold text-brand-text/40 tracking-tight">Trust Maturity Value</span>
                       <span className="text-sm font-black text-[#2B2620]">₹{Number(application.chits?.total_value).toLocaleString()}</span>
                    </div>
                 </div>
              </div>
            </section>

            <section className={`p-8 rounded-[2rem] border shadow-sm transition-all ${isHighRisk ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex justify-between items-start mb-6">
                 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text/40">Risk Intelligence</label>
                 <RiskBadge level={isHighRisk ? 'HIGH' : application.risk?.level || 'LOW'} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full bg-brand-gold/20 mr-1" />
                  <p className="text-xs font-medium text-[#2B2620]/70 leading-relaxed italic">
                    "{riskReason || 'No significant liabilities detected.'}"
                  </p>
                </div>
                <div className="p-3 bg-white/50 rounded-2xl border border-black/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/30 mb-1 leading-none">Affordability Index</p>
                   <p className="text-lg font-headline font-bold text-[#2B2620]">{riskRatio.toFixed(1)}% <span className="text-[10px] font-medium text-[#2B2620]/30 ml-1">of income</span></p>
                </div>
              </div>
            </section>
          </div>

          {/* Column 3: Documentation & Actions */}
          <div className="lg:col-span-1 space-y-6">
             <section className="bg-white p-8 rounded-[2rem] border border-[#B6955E]/10 shadow-sm">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold/60 mb-6 block">Verification Portal</label>
                <div className="space-y-4">
                  {application.documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#FDFCF7]/50 rounded-2xl border border-brand-gold/5 group">
                      <div className="flex items-center gap-4">
                         <FileText className="w-5 h-5 text-brand-gold" />
                         <div>
                            <p className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest leading-none">{doc.type}</p>
                            <p className="text-[10px] text-brand-text/40 font-bold mt-1">{doc.name}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => setViewingDoc(doc)}
                           className="p-2 bg-white rounded-xl shadow-sm text-brand-gold opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
                         {doc.status === 'verified' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                    </div>
                  ))}
                  {!application.documents?.length && (
                    <div className="text-center py-6 opacity-20 contrast-75">
                       <Info className="w-8 h-8 mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Documents Discovered</p>
                    </div>
                  )}
                </div>
             </section>

             <section className="bg-white/50 p-8 rounded-[2rem] border border-[#B6955E]/10 border-dashed">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text/30 mb-6 block">Audit History</label>
                <div className="space-y-6">
                  {application.reviewed_at ? (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                         <Check className="w-4 h-4 text-brand-gold" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-[#2B2620]">Review Finalized</p>
                         <p className="text-[10px] text-brand-text/40 mt-1 uppercase tracking-widest">By {application.reviewed_by_name || 'System'} | {new Date(application.reviewed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0 animate-pulse">
                         <Clock className="w-4 h-4 text-brand-gold" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-[#2B2620]">Pending Initial Review</p>
                         <p className="text-[10px] text-brand-text/40 mt-1 uppercase tracking-widest">Submitted {new Date(application.applied_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
             </section>
          </div>
        </div>

        {/* Tactical Interaction Dock */}
        <div className="mt-12 pt-10 border-t border-[#B6955E]/10">
          {showWarning ? (
            <div className="animate-in fade-in slide-in-from-top-4">
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] mb-8 flex gap-6 items-start">
                 <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                 <div>
                    <h4 className="text-lg font-headline font-bold text-red-700">Financial Integrity Warning</h4>
                    <p className="text-sm text-red-600/70 mt-1 leading-relaxed">
                      This candidate is flagged as <span className="font-bold">HIGH RISK</span>. The monthly commitment of 
                      ₹{monthlyCommitment.toLocaleString()} represents {riskRatio.toFixed(1)}% of their income, 
                      exceeding our recommended safety threshold of 40%.
                    </p>
                 </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-5 border-2 border-brand-gold/10 text-[#2B2620] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm"
                >
                  Cancel & Review Again
                </button>
                <button 
                  onClick={() => handleAction('approve')}
                  className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all"
                >
                  Override & Admit Anyway
                </button>
              </div>
            </div>
          ) : application.status === 'pending' || application.status === 'info_requested' ? (
            <div className="flex flex-col gap-6">
              <textarea 
                className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl p-4 text-sm font-body focus:outline-none focus:border-brand-gold/40 transition-all shadow-inner"
                placeholder="Institutional notes or messages for the applicant..."
                rows={2}
                value={infoMessage || rejectionReason}
                onChange={(e) => {
                  setInfoMessage(e.target.value)
                  setRejectionReason(e.target.value)
                }}
              />
              <div className="flex flex-wrap gap-4">
                <button 
                  disabled={processing}
                  onClick={() => handleAction('reject')}
                  className="px-8 py-5 border-2 border-[#B6955E]/10 text-brand-text/40 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2 group"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Reject Admission
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction('request')}
                  className="px-8 py-5 border-2 border-[#B6955E]/10 text-[#2B2620]/60 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-gold/5 hover:border-brand-gold/30 transition-all flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" /> Need More Info
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction('approve')}
                  className="flex-1 py-5 heritage-gradient text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-brand-gold/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> Execute Admission
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
             <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-5 bg-white border border-[#B6955E]/10 text-[#2B2620] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-gold/5 transition-all"
                >
                  Return to Dashboard
                </button>
                <button 
                  className="flex-1 py-5 border-2 border-[#B6955E]/20 text-brand-goldDark rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> Download Full Dossier
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Internal Document Viewer Modal */}
      <GlobalModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={`${viewingDoc?.type} Archive`}
        maxWidth="max-w-4xl"
      >
        {viewingDoc && (
          <div className="flex flex-col items-center justify-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold -mt-6 mb-8 text-center w-full">
               Secure institutional document node: {viewingDoc.name}
             </p>
             
             <div className="w-full aspect-[1.4/1] bg-[#FDFCF7] rounded-3xl shadow-inner border border-[#B6955E]/10 flex flex-col items-center justify-center overflow-hidden relative group">
                <div className="text-center space-y-4 opacity-20">
                   <Eye className="w-16 h-16 mx-auto text-[#2B2620]" />
                   <p className="text-xs font-black uppercase tracking-[0.4em] text-[#2B2620] italic">
                     Secure Vault Sandbox
                   </p>
                </div>
                
                {/* Watermark effect */}
                <div className="absolute -bottom-8 -right-8 opacity-[0.03] select-none pointer-events-none">
                   <ShieldCheck className="w-64 h-64 text-[#2B2620]" />
                </div>
             </div>

             <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full">
                <button className="flex-1 px-8 py-5 bg-brand-gold text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-gold/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5" /> Verify Authenticity
                </button>
                <button className="flex-1 px-8 py-5 border-2 border-[#B6955E]/20 text-[#2B2620] rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-brand-gold/5 transition-all">
                  Download Archive
                </button>
             </div>
          </div>
        )}
      </GlobalModal>
    </GlobalModal>
  )
}

export default ApplicationDetailModal
