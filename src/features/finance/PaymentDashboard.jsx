import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ChevronRight,
  PieChart
} from 'lucide-react'
import { financeService } from './api'
import toast from 'react-hot-toast'

const PaymentDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [chitProgress, setChitProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [sum, prog] = await Promise.all([
          financeService.getCollectionSummaries(),
          financeService.getChitCollectionProgress()
        ])
        setSummary(sum)
        setChitProgress(prog)
      } catch (error) {
        toast.error('Failed to load collections')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-text/40 font-black mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-headline font-bold text-brand-navy">₹{Number(value).toLocaleString('en-IN')}</span>
      </div>
      {subtitle && <p className="text-[10px] text-brand-text/30 font-medium mt-2">{subtitle}</p>}
    </div>
  )

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-brand-gold font-bold">Synchronizing Vault...</div>

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-headline font-bold text-brand-navy">Payment & Collection</h2>
        <p className="text-on-surface-variant font-body mt-2 opacity-70">Monitor financial inflows and collective trust health.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Due This Month" 
          value={summary?.totalDueThisMonth || 0} 
          icon={IndianRupee} 
          color="bg-blue-500 text-blue-500" 
        />
        <StatCard 
          title="Collected" 
          value={summary?.totalCollectedThisMonth || 0} 
          icon={TrendingUp} 
          color="bg-green-500 text-green-500" 
          subtitle={`${((summary?.totalCollectedThisMonth / summary?.totalDueThisMonth) * 100 || 0).toFixed(1)}% efficiency`}
        />
        <StatCard 
          title="Pending Total" 
          value={summary?.totalPending || 0} 
          icon={Clock} 
          color="bg-amber-500 text-amber-500" 
        />
        <StatCard 
          title="Total Overdue" 
          value={summary?.totalOverdue || 0} 
          icon={AlertCircle} 
          color="bg-red-500 text-red-500" 
          subtitle="Requires immediate action"
        />
      </div>

      {/* Chit-wise Progress */}
      <section className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-brand-gold/5 flex items-center justify-between bg-brand-gold/[0.02]">
          <div>
            <h3 className="text-xl font-headline font-bold text-brand-navy">Collective Progress</h3>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold font-black mt-1">Real-time Scheme Performance</p>
          </div>
          <PieChart className="w-6 h-6 text-brand-gold opacity-30" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-navy/[0.02]">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Scheme Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Collection Progress</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5">
              {chitProgress.map((chit) => (
                <tr 
                  key={chit.id} 
                  className="hover:bg-brand-gold/[0.02] cursor-pointer group transition-colors"
                  onClick={() => navigate(`/payments/${chit.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-brand-navy group-hover:text-brand-gold transition-colors">{chit.name}</span>
                      <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-tighter">Current Month: {chit.current_month}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-full max-w-xs">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black text-brand-navy">₹{chit.totalPaid.toLocaleString()} / ₹{chit.totalDue.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-brand-gold">{chit.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-brand-gold/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            chit.percentage >= 85 ? 'bg-green-500' : 
                            chit.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${chit.percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      chit.percentage >= 85 ? 'bg-green-100 text-green-700' : 
                      chit.percentage >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {chit.percentage >= 85 ? 'Healthy' : chit.percentage >= 60 ? 'Critical' : 'High Risk'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center gap-2 text-brand-gold font-bold text-xs group-hover:gap-4 transition-all">
                      Details <ChevronRight className="w-4 h-4" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default PaymentDashboard
