import React, { useEffect, useState } from 'react'
import { Bell, Send, Users, Search, Filter, Mail, Phone, MessageSquare, Info, Smartphone, CheckCircle2 } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    target: 'all',
    channel: 'app'
  })

  useEffect(() => {
    // Mocking for now since no backend table yet shown in schema for broadcast history
    setNotifications([
      { id: 1, title: 'Month 5 Generation', message: 'Contributions for Month 5 are now open for Platinum 5L.', target: 'Platinum 5L Members', status: 'delivered', created_at: new Date() },
      { id: 2, title: 'Loan Disbursement', message: 'Your credit request for ₹50,000 has been approved.', target: 'Member: Logheswaran', status: 'delivered', created_at: new Date() }
    ])
    setLoading(false)
  }, [])

  const handleSend = (e) => {
    e.preventDefault()
    toast.success('Broadcast transmitted successfully!')
    setIsModalOpen(false)
    setNewNotification({ title: '', message: '', target: 'all', channel: 'app' })
  }

  const columns = [
    { 
      header: 'Communication', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center border border-brand-gold/10 text-brand-gold shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-headline font-bold text-brand-navy leading-none mb-1">{row.title}</p>
            <p className="text-xs text-brand-text/40 truncate max-w-xs">{row.message}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Audience', 
      render: (row) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy bg-brand-ivory px-3 py-1 rounded-full border border-brand-gold/5">
          {row.target}
        </span>
      )
    },
    { 
      header: 'Transmission', 
      render: (row) => (
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">Dispatched • {new Date(row.created_at).toLocaleDateString()}</span>
        </div>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Broadcast Console</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Despatch trust communications and system alerts to beneficiaries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="heritage-gradient text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <Bell className="w-5 h-5" />
          Transmit Broadcast
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col">
            <Smartphone className="w-6 h-6 text-brand-gold mb-4" />
            <span className="text-3xl font-headline font-bold text-brand-navy leading-none">1,240</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Push Sent</span>
         </div>
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col">
            <Mail className="w-6 h-6 text-brand-gold mb-4" />
            <span className="text-3xl font-headline font-bold text-brand-navy leading-none">850</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Email Dispatched</span>
         </div>
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col">
            <CheckCircle2 className="w-6 h-6 text-green-600 mb-4" />
            <span className="text-3xl font-headline font-bold text-brand-navy leading-none">99.2%</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Delivery Rate</span>
         </div>
         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-brand-gold/5 flex flex-col">
            <Users className="w-6 h-6 text-blue-600 mb-4" />
            <span className="text-3xl font-headline font-bold text-brand-navy leading-none">42</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 mt-3">Target Groups</span>
         </div>
      </div>

      <DataTable columns={columns} data={notifications} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Institutional Despatch">
        <form onSubmit={handleSend} className="space-y-10">
           <div className="p-10 bg-brand-ivory rounded-[3rem] border border-brand-gold/10 shadow-inner space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Transmission Title</label>
                <input 
                  required
                  className="w-full bg-white border-2 border-brand-gold/5 rounded-3xl p-5 text-sm font-headline font-bold text-brand-navy focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/40 focus:outline-none transition-all shadow-sm"
                  placeholder="e.g. Cycle Increment Notification"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Audience Scope</label>
                  <select 
                    className="w-full bg-white border-2 border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-gold/30 transition-all shadow-sm"
                    value={newNotification.target}
                    onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}
                  >
                    <option value="all">Universal (All Members)</option>
                    <option value="platinum">Platinum 5L Members</option>
                    <option value="staff">Administrative Staff</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Channel</label>
                  <select 
                    className="w-full bg-white border-2 border-brand-gold/5 rounded-2xl p-4 text-xs font-bold text-brand-navy focus:outline-none focus:border-brand-gold/30 transition-all shadow-sm"
                    value={newNotification.channel}
                    onChange={(e) => setNewNotification({...newNotification, channel: e.target.value})}
                  >
                    <option value="app">Native Push Notification</option>
                    <option value="email">Institutional Email</option>
                    <option value="sms">SMS Text Service</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">Message Content</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-white border-2 border-brand-gold/5 rounded-3xl p-5 text-sm font-body text-brand-navy focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/40 focus:outline-none transition-all shadow-sm resize-none"
                  placeholder="Draft your communication here..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                />
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <div className="bg-brand-gold/5 p-6 rounded-3xl border border-brand-gold/10 flex gap-4 items-start">
                 <Info className="text-brand-gold w-5 h-5 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-brand-navy leading-relaxed italic opacity-70">
                   Transmission via multiple channels may incur institutional API costs. Ensure high-relevance for broadcast contents.
                 </p>
              </div>

              <button 
                type="submit"
                className="w-full heritage-gradient text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-2"
              >
                Transmit Broadcast
                <Send className="w-5 h-5" />
              </button>
           </div>
        </form>
      </Modal>
    </div>
  )
}

export default Notifications
