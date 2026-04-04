import React from 'react'
import { useDashboardStats, useRecentLedger, useDashboardExtendedData } from './hooks'
import StatsGrid from './components/StatsGrid'
import AnalyticsCharts from './components/Charts'
import CollectionHealth from './components/CollectionHealth'
import DashboardSkeleton from './components/DashboardSkeleton'
import { ChitProgressTracker } from './components/NewDashboardSections'
import AlertsPanel from './components/AlertsPanel'
import QuickActions from './components/QuickActions'
import ActivityFeed from './components/ActivityFeed'

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats()
  const { data: ledger, isLoading: ledgerLoading } = useRecentLedger()
  const { data: extended, isLoading: extendedLoading } = useDashboardExtendedData()
  const loading = statsLoading || ledgerLoading || extendedLoading
  const hasChits = (extended?.progress?.length || 0) > 0
  const hasHealth = (extended?.health?.totalExpected || 0) > 0
  const showMonitor = hasChits || hasHealth

  if (loading) return <DashboardSkeleton />

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold opacity-80">Command Center Online</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620] tracking-tight">Executive Intelligence</h2>
          <p className="text-brand-text/50 text-sm font-body mt-1">
            Real-time liquidity monitoring and operational risk management.
          </p>
        </div>
      </header>

      {/* 1. Critical KPI Grid (5 metrics) */}
      <StatsGrid stats={stats} extended={extended} isError={statsError} />

      {/* 2. Urgent Intelligence Row (Alerts + Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AlertsPanel 
            overdue={extended?.overdueDetailed} 
            auctions={extended?.auctions} 
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* 3. Analytics & Distribution */}
      <AnalyticsCharts 
        ledger={ledger || []} 
        collectionHealth={extended?.health} 
      />

      {/* 4. Monitoring & Activity */}
      <div className={`grid grid-cols-1 ${showMonitor ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {showMonitor && (
          <div className="lg:col-span-1 space-y-6">
            {hasHealth && <CollectionHealth data={extended?.health} isLoading={extendedLoading} />}
            {hasChits && <ChitProgressTracker chits={extended?.progress} />}
          </div>
        )}
        <div className={showMonitor ? 'lg:col-span-2' : 'w-full'}>
          <ActivityFeed ledger={ledger || []} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
