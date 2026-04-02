import React from 'react'

const CollectionHealth = ({ data, isLoading }) => {
  if (isLoading || !data) return (
    <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 border border-brand-gold/10 shadow-sm animate-pulse h-[400px]">
      <div className="h-6 bg-gray-200 w-1/3 mb-8 rounded"></div>
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl"></div>)}
      </div>
    </div>
  )

  const { totalExpected, collected, outstanding, chitProgress, usersYetToPay } = data

  return (
    <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 border border-brand-gold/10 shadow-sm transition-all hover:shadow-md">
      <div className="mb-8">
        <h3 className="font-headline text-xl font-bold text-[var(--text-primary)]">Monthly Collection Health</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-body uppercase tracking-widest opacity-70">Current month contribution status</p>
      </div>

      {/* Summary Numbers */}
      <div className="grid grid-cols-3 gap-4 mb-10 pb-8 border-b border-brand-gold/10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 opacity-60">Expected</p>
          <p className="text-xl font-headline font-bold text-[var(--text-primary)]">₹{(totalExpected || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 opacity-60">Collected</p>
          <p className="text-xl font-headline font-bold text-[var(--status-success)]">₹{(collected || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 opacity-60">Outstanding</p>
          <p className="text-xl font-headline font-bold text-[var(--status-danger)]">₹{(outstanding || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bars per Chit */}
      <div className="space-y-6 mb-8">
        {(chitProgress || []).map((chit, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-[var(--text-primary)]">{chit.name}</span>
              <span className="text-[var(--status-warning)]">{chit.percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#F7F5F0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--status-warning)] transition-all duration-1000" 
                style={{ width: `${chit.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {usersYetToPay > 0 && (
        <div className="pt-4 border-t border-brand-gold/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--status-danger)] animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--status-danger)]">
            {usersYetToPay} members yet to pay
          </span>
        </div>
      )}
      {usersYetToPay === 0 && (
        <div className="pt-4 border-t border-brand-gold/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--status-success)]"></div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--status-success)]">
            All month contributions cleared
          </span>
        </div>
      )}
    </div>
  )
}

export default CollectionHealth
