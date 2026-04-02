import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Coins, Wallet, ArrowUpRight } from 'lucide-react'
import StatsCard from '../../../shared/components/ui/StatsCard'
import { formatCurrency } from '../utils/format'

const StatsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex items-center gap-4 animate-pulse">
          <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

const StatsGrid = ({ stats, isError }) => {
  const navigate = useNavigate()

  if (isError) {
    return (
      <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 mb-12 text-red-700">
        <p className="font-bold">Failed to load dashboard statistics. Please check your connection.</p>
      </div>
    )
  }

  const { totalMembers, activeChits, totalCollection, pendingPayouts } = stats || {}

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <StatsCard 
        title="Total Members" 
        value={(totalMembers || 0).toLocaleString()} 
        icon={Users} 
        onClick={() => navigate('/members')}
      />
      <StatsCard 
        title="Active Chits" 
        value={(activeChits || 0).toString()} 
        icon={Coins} 
        onClick={() => navigate('/chits')}
      />
      <StatsCard 
        title="Total Collection" 
        value={formatCurrency(totalCollection || 0)} 
        icon={Wallet} 
      />
      <StatsCard 
        title="Pending Payouts" 
        value={(pendingPayouts || 0).toString()} 
        icon={ArrowUpRight} 
      />
    </div>
  )
}

export default StatsGrid
