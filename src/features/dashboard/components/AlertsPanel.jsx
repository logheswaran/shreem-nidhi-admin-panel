import React from 'react'
import { AlertCircle, Calendar, UserX, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AlertsPanel = ({ overdue = [], auctions = [] }) => {
  const navigate = useNavigate()

  // 1. Group overdue by member to find high-risk defaulters (2+ missed)
  const memberOverdueMap = overdue.reduce((acc, current) => {
    acc[current.memberName] = (acc[current.memberName] || 0) + 1
    return acc
  }, {})

  const highRiskDefaulters = Object.entries(memberOverdueMap)
    .filter(([_, count]) => count >= 2)
    .map(([name]) => name)

  const hasAlerts = overdue.length > 0 || auctions.length > 0

  if (!hasAlerts) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-green-100 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-headline font-bold text-[#2B2620]">All Protocols Clear</h3>
        <p className="text-sm text-brand-text/50 mt-2 max-w-[240px]">
          No missed payments or urgent risks detected in the current cycle.
        </p>
      </div>
    )
  }

  return (
    <div id="alerts-section" className="bg-white rounded-[2.5rem] p-8 border border-brand-gold/10 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-headline text-2xl font-bold text-[#2B2620] flex items-center gap-3">
             <Info className="w-6 h-6 text-brand-gold" />
             Strategic Alerts
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 mt-1">Urgent Action Items & Risks</p>
        </div>
        <div className="flex -space-x-2">
          {overdue.length > 0 && <span className="w-6 h-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-red-600">{overdue.length}</span>}
          {auctions.length > 0 && <span className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-600">{auctions.length}</span>}
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar flex-1 max-h-[400px]">
        {/* A. HIGH RISK DEFAULTERS */}
        {highRiskDefaulters.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <UserX className="w-3 h-3" /> High-Risk Defaulters
            </p>
            {highRiskDefaulters.map((name, idx) => (
              <div key={idx} className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex justify-between items-center group transition-all hover:bg-red-50">
                <div>
                  <p className="text-sm font-bold text-[#2B2620]">{name}</p>
                  <p className="text-[10px] text-red-600 font-medium mt-0.5">2+ Consecutive Missed Payments</p>
                </div>
                <button 
                  onClick={() => navigate('/risk')}
                  className="p-2 bg-white rounded-xl shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* B. UPCOMING AUCTIONS */}
        {auctions.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Upcoming Auctions (Next 3 Days)
            </p>
            {auctions.map((auction, idx) => (
              <div key={idx} className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex justify-between items-center group transition-all hover:bg-amber-50">
                <div>
                  <p className="text-sm font-bold text-[#2B2620]">{auction.chits?.name}</p>
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">Scheduled: {new Date(auction.scheduled_date).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => navigate('/auctions')}
                  className="p-2 bg-white rounded-xl shadow-sm text-amber-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* C. MISSED PAYMENTS */}
        {overdue.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Recent Missed Contributions
            </p>
            {overdue.slice(0, 5).map((item, idx) => (
              <div key={idx} className="bg-brand-ivory/50 border border-brand-gold/5 p-4 rounded-2xl flex justify-between items-center group transition-all hover:bg-brand-ivory">
                <div>
                  <p className="text-sm font-bold text-[#2B2620]">{item.memberName}</p>
                  <p className="text-[10px] text-brand-text/60 mt-0.5">{item.chitName} • ₹{item.amount.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => navigate('/payments')}
                  className="p-2 bg-white rounded-xl shadow-sm text-brand-gold opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={() => navigate('/risk')}
        className="w-full mt-6 py-3 bg-[#2B2620] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-black/10"
      >
        Open Risk Control Panel
      </button>
    </div>
  )
}

export default AlertsPanel
