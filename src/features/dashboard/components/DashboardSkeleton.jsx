import React from 'react'

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-[#16213E] rounded-xl ${className}`}></div>
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

      {/* KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-[#16213E] p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex items-center gap-4">
            <SkeletonPulse className="w-14 h-14 rounded-full shrink-0" />
            <div className="space-y-3 w-full">
              <SkeletonPulse className="h-3 w-1/3" />
              <SkeletonPulse className="h-6 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10 h-[400px]">
          <SkeletonPulse className="h-6 w-1/3 mb-8" />
          <SkeletonPulse className="h-full w-full rounded-2xl" />
        </div>
        <div className="bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10 h-[400px]">
          <SkeletonPulse className="h-6 w-1/3 mb-8" />
          <SkeletonPulse className="h-full w-full rounded-2xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#16213E] rounded-[2.5rem] p-8 border border-brand-gold/10">
         <SkeletonPulse className="h-6 w-1/4 mb-10" />
         <div className="space-y-4">
           {[1,2,3,4,5].map(i => (
             <SkeletonPulse key={i} className="h-16 w-full rounded-2xl" />
           ))}
         </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
