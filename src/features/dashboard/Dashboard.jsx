import React from 'react'
import { useDashboardStats, useRecentLedger, useDashboardExtendedData } from './hooks'
import StatsGrid from './components/StatsGrid'
import AnalyticsCharts from './components/Charts'
import LedgerTable from './components/LedgerTable'
import CollectionHealth from './components/CollectionHealth'
import DashboardSkeleton from './components/DashboardSkeleton'
import { OverdueAlert, LoanHealth, PendingAppsBadge, ChitProgressTracker } from './components/NewDashboardSections'

const Dashboard = () => {
  // Parallel Data Orchestration (Prompt 6.2)
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats()
  const { data: ledger, isLoading: ledgerLoading } = useRecentLedger()
  const { data: extended, isLoading: extendedLoading } = useDashboardExtendedData()
  
  const loading = statsLoading || ledgerLoading || extendedLoading

  // Skeleton Loader (Prompt 6.3)
  if (loading) return <DashboardSkeleton />

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60">System Online</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-[var(--text-primary)]">Executive Dashboard</h2>
          <p className="text-[var(--text-secondary)] font-body mt-2 opacity-70">
            Provably fair auditing and operational liquidity tracking.
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <StatsGrid stats={stats} isError={statsError} />

      {/* Primary Intelligence Row (Prompt 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CollectionHealth data={extended?.health} />
        <AnalyticsCharts ledger={ledger || []} />
      </div>

      {/* Alert & Monitoring Section (Prompt 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
           <ChitProgressTracker chits={extended?.progress} />
        </div>
        <div className="space-y-8">
           <PendingAppsBadge count={extended?.apps} />
        </div>
      </div>

      {/* Global Audit Log */}
      <div className="relative">
        <div className="flex justify-between items-end mb-8 px-4">
           <div>
             <h3 className="font-headline text-2xl font-bold text-[var(--text-primary)]">Global Audit Log</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mt-1">Real-time ledger transparency</p>
           </div>
        </div>
        <LedgerTable ledgerData={ledger || []} />
      </div>
    </div>
  )
}

export default Dashboard
