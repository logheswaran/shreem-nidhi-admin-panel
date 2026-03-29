import React, { useEffect, useState } from 'react'
import { Users, Coins, Wallet, ArrowUpRight, FileText, Calendar, Download } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { memberService } from '../services/memberService'
import { chitService } from '../services/chitService'
import { financeService } from '../services/financeService'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: '0',
    activeChits: '0',
    totalCollection: '₹0',
    pendingPayouts: '₹0'
  })
  const [recentLedger, setRecentLedger] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [members, chits, ledger, apps] = await Promise.all([
          memberService.getMembers(),
          chitService.getChits(),
          financeService.getLedger(),
          memberService.getApplications()
        ])

        // Calculate stats
        const activeChits = chits.filter(c => c.status === 'active').length
        const totalColl = ledger
          .filter(l => l.transaction_type === 'credit' && l.reference_type === 'contribution')
          .reduce((sum, l) => sum + Number(l.amount), 0)
        
        // Mocking some growth for design feel
        setStats({
          totalMembers: members.length.toLocaleString(),
          activeChits: activeChits.toString(),
          totalCollection: `₹${(totalColl / 10000000).toFixed(2)} Cr`,
          pendingPayouts: '₹28.4 L' // Placeholder for now
        })

        setRecentLedger(ledger.slice(0, 5))
        setApplications(apps.filter(a => a.status === 'pending').slice(0, 3))
      } catch (error) {
        console.error('Dashboard data fetch error:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const ledgerColumns = [
    { 
      header: 'Transaction ID', 
      accessor: 'id',
      render: (row) => <span className="font-mono text-[10px] text-brand-text/50">#TXN-{row.id.slice(0, 8).toUpperCase()}</span>
    },
    { 
      header: 'Member Profile', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center font-bold text-xs text-brand-goldDark">
            {row.profiles?.full_name?.split(' ').map(n => n[0]).join('') || '??'}
          </div>
          <span className="font-medium text-brand-navy">{row.profiles?.full_name || 'System'}</span>
        </div>
      )
    },
    { 
      header: 'Category', 
      accessor: 'reference_type',
      render: (row) => <span className="capitalize">{row.reference_type.replace('_', ' ')}</span>
    },
    { 
      header: 'Amount', 
      render: (row) => <span className={`font-bold ${row.transaction_type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>₹{Number(row.amount).toLocaleString()}</span>
    },
    { 
      header: 'Status', 
      render: () => <StatusBadge status="paid" /> // Immutable ledger is always "paid"
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      {/* Welcome Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-brand-navy">Executive Overview</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Welcome back, Admin. Here is the status of SreemNidhi assets today.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-white text-brand-navy text-sm font-bold rounded-full flex items-center gap-2 border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export Ledger
          </button>
          <button className="px-6 py-2.5 bg-white text-brand-navy text-sm font-bold rounded-full flex items-center gap-2 border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatsCard title="Total Members" value={stats.totalMembers} icon={Users} trend="12%" trendType="up" />
        <StatsCard title="Active Chits" value={stats.activeChits} icon={Coins} trend="05%" trendType="up" />
        <StatsCard title="Total Collection" value={stats.totalCollection} icon={Wallet} trend="18%" trendType="up" />
        <StatsCard title="Pending Payouts" value={stats.pendingPayouts} icon={ArrowUpRight} trend="In Process" trendType="up" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Ledger Table */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-headline text-2xl font-bold text-brand-navy">Recent Ledger Entries</h3>
            <button className="text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All Entries <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <DataTable columns={ledgerColumns} data={recentLedger} loading={loading} />
        </div>

        {/* Candidate Review Sidebar */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-headline text-2xl font-bold text-brand-navy">Candidate Review</h3>
            <span className="bg-brand-gold/10 text-brand-goldDark px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              {applications.length} NEW
            </span>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-brand-gold/10 p-6 flex flex-col divide-y divide-brand-gold/5">
            {loading ? (
              <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <div key={app.id} className="py-6 first:pt-0 last:pb-0 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full heritage-gradient flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {app.profiles?.full_name?.[0] || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-brand-navy text-base">{app.profiles?.full_name}</h4>
                        <span className="text-[10px] text-brand-text/40 font-bold uppercase">{new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-brand-text/60 mt-1">Applied for <span className="font-bold text-brand-gold">"{app.chits?.name}"</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2.5 heritage-gradient text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md hover:brightness-110 transition-all">Review App</button>
                    <button className="px-6 py-2.5 bg-brand-ivory text-brand-text/60 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-gold/10 transition-all">Later</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30 italic font-body">No pending candidates for review</div>
            )}
            <button className="mt-4 py-4 w-full text-brand-gold font-bold text-[10px] uppercase tracking-widest border-t border-dashed border-brand-gold/20 hover:text-brand-goldDark transition-colors">
              View All Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
