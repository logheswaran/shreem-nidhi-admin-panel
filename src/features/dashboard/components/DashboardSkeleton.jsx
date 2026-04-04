import React from 'react'

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-[#EAE6D9] rounded-xl ${className}`}></div>
)

const DashboardSkeleton = () => {
  return (
    <div className="space-y-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="space-y-4 w-full md:w-1/3">
          <SkeletonPulse className="h-10 w-3/4" />
          <SkeletonPulse className="h-4 w-1/2" />
        </div>
      </div>

      {/* 1. KPI Stats Grid Skeleton (5 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white dark:bg-[#16213E] p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex items-center gap-4">
            <SkeletonPulse className="w-14 h-14 rounded-full shrink-0" />
            <div className="space-y-3 w-full">
              <SkeletonPulse className="h-3 w-1/3" />
              <SkeletonPulse className="h-6 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Alerts & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10 h-[400px]">
          <SkeletonPulse className="h-8 w-1/4 mb-10" />
          <div className="space-y-6">
            {[1,2,3].map(i => <SkeletonPulse key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        </div>
        <div className="bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10 h-[400px]">
          <SkeletonPulse className="h-8 w-1/2 mb-10" />
          <div className="grid gap-4">
            {[1,2,3,4].map(i => <SkeletonPulse key={i} className="h-12 w-full rounded-2xl" />)}
          </div>
        </div>
      </div>

      {/* 3. Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10 h-[450px]">
          <SkeletonPulse className="h-8 w-1/3 mb-10" />
          <SkeletonPulse className="h-[300px] w-full rounded-2xl" />
        </div>
        <div className="bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10 h-[450px]">
          <SkeletonPulse className="h-8 w-1/3 mb-10" />
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <SkeletonPulse key={i} className="h-14 w-full rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
