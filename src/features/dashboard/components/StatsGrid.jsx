import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Coins, Wallet, ArrowUpRight, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import StatsCard from '../../../shared/components/ui/StatsCard'
import { formatCurrency } from '../utils/format'

const StatsGrid = ({ stats, extended, isError }) => {
  const navigate = useNavigate()

  if (isError) {
    return (
      <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 mb-12 text-red-700">
        <p className="font-bold">Failed to load dashboard statistics. Please check your connection.</p>
      </div>
    )
  }

  const { totalMembers, activeChits, pendingCollection } = stats || {}
  const { overdueDetailed, cashFlow } = extended || {}

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      {/* 1. Total Members */}
      <StatsCard 
        title="Total Members" 
        value={(totalMembers || 0).toLocaleString()} 
        icon={Users} 
        onClick={() => navigate('/members')}
      />

      {/* 2. Pending Collection (URGENT) */}
      <StatsCard 
        title="Pending (Month)" 
        value={formatCurrency(pendingCollection || 0)} 
        icon={Wallet} 
        onClick={() => navigate('/payments')}
        urgency={pendingCollection > 0 ? 'warning' : 'normal'}
      />

      {/* 3. Overdue Members (CRITICAL) */}
      <StatsCard 
        title="Overdue Members" 
        value={(overdueDetailed?.length || 0).toString()} 
        icon={AlertCircle} 
        onClick={() => navigate('/risk')}
        urgency={overdueDetailed?.length > 0 ? 'danger' : 'normal'}
        trend={overdueDetailed?.length > 0 ? `${overdueDetailed.length} Action Items` : "All Clear"}
        trendType={overdueDetailed?.length > 0 ? "down" : "up"}
      />

      {/* 4. Active Chits */}
      <StatsCard 
        title="Active Chits" 
        value={(activeChits || 0).toString()} 
        icon={Coins} 
        onClick={() => navigate('/chits')}
      />

      {/* 5. Cash Flow (Net) */}
      <StatsCard 
        title="Monthly Cash Flow" 
        value={formatCurrency(cashFlow?.net || 0)} 
        icon={TrendingUp} 
        onClick={() => navigate('/ledger')}
        trend={cashFlow?.net >= 0 ? "Positive" : "Negative"}
        trendType={cashFlow?.net >= 0 ? "up" : "down"}
      />
    </div>
  )
}

export default StatsGrid
