import React from 'react'
import { useDashboardStats, useRecentLedger } from './hooks'
import StatsGrid from './components/StatsGrid'
import AnalyticsCharts from './components/Charts'
import LedgerTable from './components/LedgerTable'

const Dashboard = () => {

  // Fetch Data using React Query
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats()
  const { data: ledger, isLoading: ledgerLoading } = useRecentLedger()
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Executive Dashboard</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">
            Real-time collective tracking and administrative protocols.
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <StatsGrid stats={stats} isLoading={statsLoading} isError={statsError} />

      {/* Analytics Visualization */}
      <AnalyticsCharts ledger={ledger || []} />

      {/* General Ledger Preview */}
      <LedgerTable ledgerData={ledger || []} isLoading={ledgerLoading} />
    </div>
  )
}

export default Dashboard
