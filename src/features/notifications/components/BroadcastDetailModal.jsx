import React, { useState } from 'react'
import { 
  X, Send, RefreshCw, Copy, 
  MessageSquare, Users, CheckCircle2, 
  AlertCircle, Clock, Smartphone, Mail, Hash
} from 'lucide-react'
import GlobalModal from '../../../shared/components/ui/GlobalModal'

/**
 * COMPONENT: Broadcast Detail Modal
 * Standardized detail view for past transmissions.
 */
const BroadcastDetailModal = ({ 
  isOpen, 
  onClose, 
  broadcast, 
  onResendFailed, 
  onDuplicate 
}) => {
  if (!broadcast) return null
  const [pendingAction, setPendingAction] = useState(null)

  const stats = [
    { label: 'Total Recipients', value: broadcast.total_recipients || 120, icon: Users, color: 'text-[#2B2620]' },
    { label: 'Delivered', value: broadcast.delivered_count || 116, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Failed', value: broadcast.failed_count || 4, icon: AlertCircle, color: 'text-red-500' },
    { label: 'Pending', value: broadcast.pending_count || 0, icon: Clock, color: 'text-amber-500' }
  ]

  const channels = Array.isArray(broadcast.channel) ? broadcast.channel : [broadcast.channel || 'Push']

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transmission Intelligence"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col">
        {/* Sub-header info */}
        <div className="flex items-center justify-between -mt-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold">
              Ref: {String(broadcast.id || '').slice(0, 8)}
            </span>
            <div className="flex gap-2">
              {channels.map(ch => (
                <span key={ch} className="px-3 py-1 bg-brand-gold/5 border border-brand-gold/10 rounded-full text-[9px] font-black uppercase tracking-widest text-brand-gold">
                  {ch}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">
            {new Date(broadcast.created_at).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Message & Stats */}
          <div className="lg:col-span-12 xl:col-span-12 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-brand-gold/5 flex flex-col items-center text-center">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <span className="text-2xl font-headline font-bold text-[#2B2620]">{stat.value}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-text/30 mt-1">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Message Body Content */}
            <div className="bg-[#FDFCF7] p-8 rounded-[2rem] border border-brand-gold/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <MessageSquare className="w-24 h-24 text-[#2B2620]" />
               </div>
               <h4 className="text-xl font-headline font-bold text-[#2B2620] mb-4 relative z-10">{broadcast.title}</h4>
               <p className="text-sm text-brand-text/70 leading-relaxed font-body relative z-10 whitespace-pre-wrap">
                 {broadcast.message}
               </p>
            </div>

            {/* Recipient Breakdown Fragment */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2B2620]/30 flex items-center gap-2">
                 <Users className="w-4 h-4 text-brand-gold" />
                 Recipient Tracking Breakdown
               </h3>
               <div className="bg-white/30 rounded-[2rem] border border-brand-gold/5 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-brand-gold/5">
                     <tr>
                       <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[#2B2620]/40">Member Name</th>
                       <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[#2B2620]/40">Status</th>
                       <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[#2B2620]/40">Attempted</th>
                     </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/5">
                      {[1, 2, 3].map((_, idx) => (
                        <tr key={idx} className="hover:bg-brand-gold/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-[#2B2620]">Sample Member {idx + 1}</p>
                            <p className="text-[9px] text-brand-text/30 mt-0.5">88******89</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${idx === 2 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {idx === 2 ? 'Failed' : 'Delivered'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold text-brand-text/30 uppercase tracking-widest">
                            {idx === 2 ? '3 Attempts' : 'Instant'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-4 pt-6 border-t border-[#B6955E]/10">
               <button 
                onClick={() => onDuplicate(broadcast)}
                className="flex-1 py-5 bg-white border-2 border-brand-gold/10 text-[#2B2620] rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
               >
                 <Copy className="w-4 h-4" /> Component Clone (Duplicate)
               </button>
               <button 
                onClick={() => onResendFailed(broadcast)}
                className="flex-1 py-5 heritage-gradient text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-gold/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
               >
                 <RefreshCw className="w-4 h-4" /> Resend Failed Entry Only
               </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  )
}

export default BroadcastDetailModal
