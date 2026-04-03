import React, { useEffect, useState } from 'react'
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar,
  TrendingUp,
  Users,
  Gavel,
  History,
  FileText
} from 'lucide-react'
import { financeService } from '../finance/api'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'
import toast from 'react-hot-toast'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('collection')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ 
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const tabs = [
    { id: 'collection', label: 'Daily Collection', icon: History },
    { id: 'profit', label: 'Monthly Profit', icon: TrendingUp },
    { id: 'defaulters', label: 'Pending Payments', icon: FileText },
    { id: 'members', label: 'Member Growth', icon: Users },
  ]

  const fetchReport = async () => {
    try {
      setLoading(true)
      let data = []
      if (activeTab === 'collection') {
        data = await financeService.getDailyCollectionReport(dateRange.from)
      } else if (activeTab === 'profit') {
        data = await financeService.getMonthlyProfitReport()
      } else if (activeTab === 'defaulters') {
        data = await financeService.getDefaulters()
      } else if (activeTab === 'members') {
        // Simple mock for now or fetch member count by month
        data = [
          { month: '2026-01', count: 45 },
          { month: '2026-02', count: 52 },
          { month: '2026-03', count: 68 },
          { month: '2026-04', count: 85 }
        ]
      }
      setReportData(data)
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [activeTab, dateRange])

  const exportCSV = () => {
    if (!reportData.length) return
    const headers = Object.keys(reportData[0]).join(',')
    const rows = reportData.map(row => 
      Object.values(row).map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(',')
    ).join('\n')
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="animate-in fade-in duration-700 print:p-0">
      <header className="mb-10 flex items-end justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3 text-brand-gold mb-2">
             <BarChart3 className="w-6 h-6" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Intelligence Hub</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Reports & Analytics</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Synthesize deep financial insights and growth metrics.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={exportCSV}
             className="flex items-center gap-2 bg-brand-gold/[0.03] border border-brand-gold/20 px-6 py-3 rounded-2xl text-xs font-bold text-brand-gold hover:bg-brand-gold hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm active:scale-95"
           >
             <Download className="w-4 h-4" /> Export CSV
           </button>
           <button 
             onClick={printReport}
             className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-brand-navyDark transition-all shadow-xl active:scale-95"
           >
             <Printer className="w-4 h-4" /> Print Report
           </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white/50 p-1.5 rounded-[2rem] border border-brand-gold/5 w-fit print:hidden">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => {
               setActiveTab(tab.id);
               setReportData([]);
             }}
             className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === tab.id 
                 ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' 
                 : 'text-brand-navy/40 hover:bg-brand-gold/5'
             }`}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl p-8 min-h-[500px]">
         {loading ? (
           <div className="h-96 flex items-center justify-center animate-pulse text-brand-gold font-bold uppercase tracking-widest">Compiling Dataset...</div>
         ) : (
           <div className="space-y-8">
              {/* Daily Collection Table */}
              {activeTab === 'collection' && (
                <div className="overflow-x-auto">
                    <div className="mb-6 flex justify-between items-center bg-brand-gold/[0.02] p-6 rounded-3xl border border-brand-gold/5">
                       <h4 className="font-headline font-bold text-brand-navy text-xl">Daily Ledger Dispatch</h4>
                       <input 
                         type="date" 
                         value={dateRange.from}
                         onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                         className="bg-white border-2 border-brand-gold/10 rounded-xl px-4 py-2 text-xs font-bold text-brand-navy outline-none focus:border-brand-gold"
                       />
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-gold/5">
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Delegate</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Scheme</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Receipt #</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Amount</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gold/5">
                        {reportData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-brand-gold/[0.01]">
                            <td className="py-4 font-bold text-brand-navy text-sm">{item.chit_members?.profiles?.full_name}</td>
                            <td className="py-4 text-xs font-bold text-brand-text/60">{item.chits?.name}</td>
                            <td className="py-4 font-mono text-[10px] text-brand-gold">TX-{item.id?.slice(0, 8).toUpperCase() || 'N/A'}</td>
                            <td className="py-4 font-black text-brand-navy">₹{Number(item.amount_paid).toLocaleString()}</td>
                            <td className="py-4 text-[10px] font-bold text-brand-text/30">{new Date(item.paid_at).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              )}

              {/* Profit Chart */}
              {activeTab === 'profit' && (
                <div className="h-[400px] w-full">
                  <div className="mb-8">
                     <h4 className="font-headline font-bold text-brand-navy text-xl">Operational Commission Trend</h4>
                     <p className="text-[10px] font-black text-brand-gold tracking-widest uppercase opacity-60">Aggregate Performance per Cycle</p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B6458', fontSize: 10, fontWeight: 700}}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B6458', fontSize: 10, fontWeight: 700}}
                        tickFormatter={(val) => `₹${val/1000}k`}
                      />
                      <Tooltip 
                        cursor={{fill: '#F7F5F0'}}
                        contentStyle={{
                          borderRadius: '1rem',
                          border: 'none',
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                          padding: '16px'
                        }}
                      />
                      <Bar dataKey="amount" fill="#C49A1A" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Member Growth Chart */}
              {activeTab === 'members' && (
                <div className="h-[400px] w-full">
                  <div className="mb-8">
                     <h4 className="font-headline font-bold text-brand-navy text-xl">Delegate Expansion Index</h4>
                     <p className="text-[10px] font-black text-brand-gold tracking-widest uppercase opacity-60">Trust Network Growth Dynamics</p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B6458', fontSize: 10, fontWeight: 700}}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B6458', fontSize: 10, fontWeight: 700}}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#C49A1A" 
                        strokeWidth={4} 
                        dot={{fill: '#C49A1A', strokeWidth: 2, r: 6, stroke: '#fff'}}
                        activeDot={{r: 8, strokeWidth: 0}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Defaulters Table (Simple list version for report) */}
              {activeTab === 'defaulters' && (
                 <div className="overflow-x-auto">
                    <h4 className="font-headline font-bold text-brand-navy text-xl mb-6">Aggregate Liability Analysis</h4>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-gold/5">
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Delegate</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Scheme</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Months Overdue</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-text/40">Total Arrears</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gold/5">
                        {reportData.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-4 font-bold text-brand-navy text-sm">{item.full_name}</td>
                            <td className="py-4 text-xs font-bold text-brand-text/60">{item.chit_name}</td>
                            <td className="py-4 font-mono text-[10px] text-brand-gold">{item.overdue_count}</td>
                            <td className="py-4 font-black text-red-600">₹{Number(item.total_overdue_amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              )}
           </div>
         )}
      </div>
    </div>
  )
}

export default Reports
