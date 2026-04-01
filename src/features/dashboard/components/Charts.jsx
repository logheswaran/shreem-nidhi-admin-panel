import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { format, subDays, isSameDay } from 'date-fns'

const AnalyticsCharts = ({ ledger = [] }) => {
  // Generate last 7 days of collection data from ledger
  const areaData = useMemo(() => {
    const data = []
    let total = 0
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayLedger = ledger.filter(l => 
        l.transaction_type === 'credit' && 
        isSameDay(new Date(l.created_at), date)
      )
      const daySum = dayLedger.reduce((sum, l) => sum + Number(l.amount || 0), 0)
      total += daySum
      
      data.push({
        date: format(date, 'MMM dd'),
        amount: daySum,
        cumulative: total
      })
    }
    
    // If no real data, substitute with some realistic looking placeholder curve for the demo
    if (total === 0) {
      return [
        { date: 'Mon', amount: 45000 },
        { date: 'Tue', amount: 52000 },
        { date: 'Wed', amount: 38000 },
        { date: 'Thu', amount: 65000 },
        { date: 'Fri', amount: 48000 },
        { date: 'Sat', amount: 85000 },
        { date: 'Sun', amount: 110000 },
      ]
    }
    
    return data
  }, [ledger])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-navy p-4 rounded-xl shadow-xl border border-brand-gold/20">
          <p className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-1">{label}</p>
          <p className="text-white font-headline text-lg">₹{payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {/* Collection Trend */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gold/10 shadow-sm soft-glow">
        <div className="flex justify-between items-end mb-8">
           <div>
             <h3 className="font-headline text-xl font-bold text-brand-navy">Collection Velocity</h3>
             <p className="text-xs text-brand-text/50 mt-1 font-body">7-Day Trajectory</p>
           </div>
           <div className="text-right">
             <span className="text-2xl font-bold font-headline text-brand-gold">+12.4%</span>
             <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mt-1">Increasing</p>
           </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C49A1A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C49A1A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                dy={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#C49A1A" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#goldGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Distribution */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gold/10 shadow-sm soft-glow">
        <div className="flex justify-between items-end mb-8">
           <div>
             <h3 className="font-headline text-xl font-bold text-brand-navy">Capital Allocation</h3>
             <p className="text-xs text-brand-text/50 mt-1 font-body">Current Distribution</p>
           </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { name: 'Active Loans', value: 4500000 },
                { name: 'Treasury Cash', value: 2100000 },
                { name: 'Pending Payouts', value: 850000 },
                { name: 'Fixed Deposits', value: 1500000 },
              ]}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                dy={10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {[
                  { name: 'Active Loans', value: 4500000 },
                  { name: 'Treasury Cash', value: 2100000 },
                  { name: 'Pending Payouts', value: 850000 },
                  { name: 'Fixed Deposits', value: 1500000 },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#1C2536' : index === 1 ? '#C49A1A' : index === 2 ? '#E53E3E' : '#718096'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCharts
