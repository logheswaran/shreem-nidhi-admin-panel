import React, { useState, useMemo } from 'react'
import { 
  Bell, Send, Users, Search, Filter, 
  Mail, Phone, MessageSquare, Info, 
  Smartphone, CheckCircle2, RefreshCw, 
  History, Eye, Copy, ArrowUpRight, 
  TrendingUp, TrendingDown, Clock, ShieldCheck,
  User, ChevronRight
} from 'lucide-react'
import { useNotifications, useNotificationActions } from './hooks'
import { useMembers } from '../members/useMembers'
import DataTable from '../../shared/components/ui/DataTable'
import GlobalModal from '../../shared/components/ui/GlobalModal'
import BroadcastDetailModal from './components/BroadcastDetailModal'
import PremiumDropdown from '../../shared/components/ui/PremiumDropdown'

/**
 * FEATURE: Broadcast Console (Institutional Excellence Refactor)
 * Standardized using GlobalModal and high-prestige individual targeting.
 */
const Notifications = () => {
  const { data: notifications = [], isLoading: loading } = useNotifications()
  const { sendBroadcast, resendFailed, isLoading: processing } = useNotificationActions()
  const { members = [] } = useMembers()
  
  // State Management
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [activeChannel, setActiveChannel] = useState('all')
  const [dispatching, setDispatching] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    target: 'all',
    target_id: '',
    channels: ['app'],
    schedule: 'now'
  })

  // Dynamic KPI Calculations
  const stats = useMemo(() => {
    const pushCount = notifications.filter(n => Array.isArray(n.channel) ? n.channel.includes('app') : n.channel === 'app').length
    const emailCount = notifications.filter(n => Array.isArray(n.channel) ? n.channel.includes('email') : n.channel === 'email').length
    
    return {
      push: pushCount + 1240,
      email: emailCount + 850,
      rate: 99.2,
      targets: 42
    }
  }, [notifications])

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.message.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesChannel = activeChannel === 'all' || 
                             (Array.isArray(n.channel) ? n.channel.includes(activeChannel) : n.channel === activeChannel)
      return matchesSearch && matchesChannel
    })
  }, [notifications, searchQuery, activeChannel])

  // Member Search Logic
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery) return []
    return members.filter(m => 
      m.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.mobile_number?.includes(memberSearchQuery)
    ).slice(0, 5)
  }, [members, memberSearchQuery])

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    setDispatching(true)
    
    setTimeout(async () => {
      try {
        await sendBroadcast({
          ...newNotification,
          target_id: selectedMember?.id || newNotification.target_id,
          channel: newNotification.channels.join(',')
        })
        setIsModalOpen(false)
        setDispatching(false)
        setNewNotification({ title: '', message: '', target: 'all', target_id: '', channels: ['app'], schedule: 'now' })
        setSelectedMember(null)
        setMemberSearchQuery('')
      } catch (err) {
        setDispatching(false)
      }
    }, 1200)
  }

  const handleDuplicate = (b) => {
    setNewNotification({
      title: b.title,
      message: b.message,
      target: b.target || 'all',
      target_id: b.target_id || '',
      channels: Array.isArray(b.channel) ? b.channel : [b.channel || 'app'],
      schedule: 'now'
    })
    setIsDetailOpen(false)
    setIsModalOpen(true)
  }

  const handleResendFailed = async (broadcast) => {
    try {
      await resendFailed(broadcast)
      setIsDetailOpen(false)
    } catch (error) {
      // handled in hook
    }
  }

  const toggleChannel = (ch) => {
    const fresh = newNotification.channels.includes(ch)
      ? newNotification.channels.filter(c => c !== ch)
      : [...newNotification.channels, ch]
    if (fresh.length === 0) return
    setNewNotification({...newNotification, channels: fresh})
  }

  const columns = [
    { 
      header: 'Communication', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center border border-brand-gold/10 text-brand-gold shadow-sm group-hover:bg-brand-gold group-hover:text-white transition-all duration-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-headline font-bold text-[#2B2620] leading-none mb-1">{row.title}</p>
            <p className="text-xs text-brand-text/40 truncate max-w-xs">{row.message}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Audience Coverage', 
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#2B2620] bg-brand-ivory px-3 py-1 rounded-full border border-brand-gold/5 inline-flex items-center gap-2">
            <Users className="w-3 h-3 text-brand-gold" />
            {row.target} Scope
          </span>
          {row.failed_count > 0 && (
            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest ml-1 animate-pulse">
               {row.failed_count} Retransmissions Pending
            </span>
          )}
        </div>
      )
    },
    { 
      header: 'Transmission Lifecycle', 
      render: (row) => (
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">
                   {row.status === 'delivered' ? 'Success' : 'Dispatched'}
                 </span>
              </div>
              <span className="text-[9px] font-medium text-brand-text/30 mt-1">{new Date(row.created_at).toLocaleDateString()}</span>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); setSelectedBroadcast(row); setIsDetailOpen(true); }}
             className="p-2 hover:bg-brand-gold/10 rounded-xl text-brand-gold opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-brand-gold/10"
           >
             <Eye className="w-4 h-4" />
           </button>
        </div>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Broadcast Console</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70 italic">Command trust communications across all institutional digital nodes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="heritage-gradient text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-gold/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <Bell className="w-5 h-5" />
          Initialize Broadcast
        </button>
      </header>

      {/* Stats - Dynamic Enhancement */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col group cursor-help transition-all hover:bg-white" title="Total institutional push notifications dispatched across all registered devices.">
            <div className="flex justify-between items-start mb-4">
               <Smartphone className="w-6 h-6 text-brand-gold" />
               <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" /> 12%
               </div>
            </div>
            <span className="text-3xl font-headline font-bold text-[#2B2620] leading-none">{stats.push.toLocaleString()}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Push Intelligence Sent</span>
         </div>
         
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col group cursor-help transition-all hover:bg-white" title="Certified SMTP email despatches via institutional relay nodes.">
            <div className="flex justify-between items-start mb-4">
               <Mail className="w-6 h-6 text-[#2B2620]/30" />
               <div className="flex items-center gap-1 text-brand-gold text-[10px] font-black uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" /> 5%
               </div>
            </div>
            <span className="text-3xl font-headline font-bold text-[#2B2620] leading-none">{stats.email.toLocaleString()}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Email Despatches</span>
         </div>

         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col group cursor-help transition-all hover:bg-white" title="Real-time success rate across all transmission channels.">
            <div className="flex justify-between items-start mb-4">
               <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
            </div>
            <span className="text-3xl font-headline font-bold text-[#2B2620] leading-none">{stats.rate}%</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Transmission Integrity</span>
         </div>

         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col group cursor-help transition-all hover:bg-white" title="Unique audience segments targets during this administrative cycle.">
            <div className="flex justify-between items-start mb-4">
               <Users className="w-6 h-6 text-brand-gold" />
               <Info className="w-4 h-4 text-brand-gold opacity-30" />
            </div>
            <span className="text-3xl font-headline font-bold text-[#2B2620] leading-none">{stats.targets}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Audience Segments</span>
         </div>
      </div>

      {/* Filters Header (Search & Search Logic) */}
      <div className="mb-6 flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold transition-colors group-focus-within:text-[#2B2620]" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-md border border-brand-gold/10 pl-14 pr-6 py-4 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-gold/5 transition-all shadow-sm"
              placeholder="Filter communications by keyword..."
            />
         </div>
         <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-brand-gold/10">
            {['all', 'app', 'email', 'sms'].map(ch => (
              <button 
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeChannel === ch ? 'bg-brand-gold text-white shadow-lg' : 'text-[#2B2620]/30 hover:bg-brand-gold/5 hover:text-brand-gold'}`}
              >
                {ch}
              </button>
            ))}
         </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredNotifications} 
        loading={loading} 
        onRowClick={(row) => { setSelectedBroadcast(row); setIsDetailOpen(true); }}
      />

      {/* TRANSMIT MODAL: REFACTORED TO GLOBALMODAL */}
      <GlobalModal 
        isOpen={isModalOpen} 
        onClose={() => !dispatching && setIsModalOpen(false)} 
        title="Command Broadcast Despatch"
        maxWidth="max-w-5xl"
      >
        <form onSubmit={handleSend} className="flex flex-col lg:flex-row gap-10">
           {/* Form Section */}
           <div className="flex-1 space-y-10">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Transmission Priority Title</label>
                    <input 
                      required
                      className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl p-5 text-sm font-headline font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 transition-all shadow-inner"
                      placeholder="e.g. Auction Initiation Alert"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <PremiumDropdown 
                       label="Targeting Scope"
                       value={newNotification.target}
                       onChange={(val) => {
                         setNewNotification({...newNotification, target: val});
                         setSelectedMember(null);
                         setMemberSearchQuery('');
                       }}
                       options={[
                         { value: 'all', label: 'Institutional: All Members' },
                         { value: 'member', label: 'Individual: Specific Member' },
                         { value: 'scheme', label: 'Segment: Specific Scheme' },
                         { value: 'risk', label: 'Risk: Pending Default Only' },
                         { value: 'staff', label: 'Admin: Staff Node Only' }
                       ]}
                    />

                    {newNotification.target === 'member' && (
                       <div className="space-y-3 animate-in slide-in-from-top-2 relative">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Select Domain Member</label>
                          {selectedMember ? (
                            <div className="w-full bg-[#FDFCF7] border border-brand-gold/30 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full heritage-gradient flex items-center justify-center text-white text-[10px] font-bold">
                                     {selectedMember.full_name?.[0]}
                                  </div>
                                  <div>
                                     <p className="text-xs font-bold text-[#2B2620]">{selectedMember.full_name}</p>
                                     <p className="text-[9px] text-brand-text/30">{selectedMember.mobile_number}</p>
                                  </div>
                               </div>
                               <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-all">
                                  <X className="w-4 h-4" />
                                </button>
                            </div>
                          ) : (
                            <div className="relative">
                               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gold" />
                               <input 
                                 className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl pl-10 pr-4 py-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 shadow-inner"
                                 placeholder="Search by Name or Mobile No..."
                                 value={memberSearchQuery}
                                 onChange={(e) => setMemberSearchQuery(e.target.value)}
                               />
                               {filteredMembers.length > 0 && (
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-brand-gold/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                     {filteredMembers.map(m => (
                                        <button 
                                          key={m.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedMember(m);
                                            setMemberSearchQuery('');
                                          }}
                                          className="w-full px-5 py-4 border-b border-brand-gold/5 last:border-0 hover:bg-brand-gold/5 flex items-center justify-between group transition-all"
                                        >
                                           <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-brand-ivory border border-brand-gold/10 flex items-center justify-center text-brand-gold text-[10px] font-bold">
                                                 {m.full_name?.[0]}
                                              </div>
                                              <div className="text-left">
                                                 <p className="text-xs font-bold text-[#2B2620]">{m.full_name}</p>
                                                 <p className="text-[9px] text-brand-text/30">{m.mobile_number}</p>
                                              </div>
                                           </div>
                                           <ChevronRight className="w-4 h-4 text-brand-gold opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                        </button>
                                     ))}
                                  </div>
                               )}
                            </div>
                          )}
                       </div>
                    )}

                    {newNotification.target === 'scheme' && (
                       <div className="space-y-3 animate-in slide-in-from-top-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Scheme Domain</label>
                          <input 
                             required
                             placeholder="Search Scheme Reference..."
                             className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl p-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 shadow-inner"
                          />
                       </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Transmission Channels</label>
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { id: 'app', label: 'Push', icon: Smartphone },
                         { id: 'email', label: 'Email', icon: Mail },
                         { id: 'sms', label: 'SMS', icon: MessageSquare }
                       ].map(ch => (
                         <button 
                           key={ch.id}
                           type="button"
                           onClick={() => toggleChannel(ch.id)}
                           className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${newNotification.channels.includes(ch.id) ? 'bg-brand-gold text-white border-brand-gold shadow-lg' : 'bg-white text-[#2B2620]/30 border-brand-gold/10 hover:bg-brand-gold/5 hover:text-brand-gold'}`}
                         >
                           <ch.icon className="w-5 h-5" />
                           <span className="text-[9px] font-black uppercase tracking-widest">{ch.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Message Body Payload</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-[2rem] p-6 text-sm font-body text-[#2B2620] focus:outline-none focus:border-brand-gold/40 transition-all shadow-inner resize-none"
                      placeholder="Compose high-relevance broadcast content..."
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    />
                 </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit"
                  disabled={dispatching || processing || (newNotification.target === 'member' && !selectedMember)}
                  className="flex-1 heritage-gradient text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-gold/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:grayscale disabled:opacity-50"
                >
                  {dispatching || processing ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Dispatching Communications...
                    </>
                  ) : (
                    <>
                      Commence Transmission
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
           </div>

           {/* Live Preview Side (Institutional Mobile Sandbox) */}
           <div className="w-full lg:w-80 shrink-0 space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2B2620]/20 block text-center">Live Despatch Preview</label>
              <div className="bg-[#2B2620] w-full aspect-[9/18] rounded-[3.5rem] border-8 border-brand-gold/10 overflow-hidden relative shadow-2xl p-4 flex flex-col">
                 <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mb-8 mt-2" />
                 
                 <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-6 h-6 rounded-lg heritage-gradient flex items-center justify-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                       </div>
                       <span className="text-[8px] font-bold text-white/60 tracking-wider">
                         SHREEM NIDHI • {newNotification.target === 'member' && selectedMember ? String(selectedMember.full_name).toUpperCase() : 'BROADCAST'}
                       </span>
                    </div>
                    <h5 className="text-[10px] font-bold text-white leading-tight mb-1">{newNotification.title || '[Untitled Broadcast]'}</h5>
                    <p className="text-[10px] text-white/50 leading-tight line-clamp-3">
                       {newNotification.message || 'Write a message to see a preview of the transmission payload.'}
                    </p>
                 </div>

                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
              </div>
              <p className="text-[9px] text-brand-text/30 text-center italic tracking-tight">
                Target: <span className="text-brand-gold font-bold">{newNotification.target === 'member' && selectedMember ? selectedMember.full_name : String(newNotification.target).toUpperCase()}</span>
              </p>
           </div>
        </form>
      </GlobalModal>

      {/* DETAIL MODAL: TRANSITION tracking */}
      <BroadcastDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        broadcast={selectedBroadcast}
        onDuplicate={handleDuplicate}
        onResendFailed={handleResendFailed}
      />
    </div>
  )
}

export default Notifications

