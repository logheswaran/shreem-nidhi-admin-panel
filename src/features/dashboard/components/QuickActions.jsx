import React from 'react'
import { UserPlus, IndianRupee, Gavel, Bell, PlusCircle, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActions = ({ onNewAction }) => {
  const navigate = useNavigate()

  const actions = [
    { label: 'Add Member', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', path: '/members' },
    { label: 'Record Payment', icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50', path: '/payments' },
    { label: 'Start Auction', icon: Gavel, color: 'text-brand-gold', bg: 'bg-brand-gold/10', path: '/auctions' },
    { label: 'Send Notification', icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50', path: '/notifications' },
    { label: 'Create Chit', icon: PlusCircle, color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/chits' },
  ]

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gold/10 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-brand-gold/10 rounded-xl">
          <Zap className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <h3 className="font-headline text-xl font-bold text-[#2B2620] leading-none">Quick Actions</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 mt-1">One-click operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 flex-1">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => action.action ? action.action() : navigate(action.path)}
            className="flex items-center gap-4 p-4 rounded-2xl border border-brand-gold/5 hover:border-brand-gold/20 hover:bg-brand-ivory/50 transition-all group group"
          >
            <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-[#2B2620] group-hover:translate-x-1 transition-transform">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
