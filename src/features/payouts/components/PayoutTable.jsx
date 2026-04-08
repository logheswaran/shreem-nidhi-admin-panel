import React from 'react'
import DataTable from '../../../shared/components/ui/DataTable'
import StatusBadge from '../../../shared/components/ui/StatusBadge'

const PayoutTable = ({ payouts = [], loading = false }) => {
  const columns = [
    { 
      header: 'Beneficiary', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center font-bold text-sm text-brand-gold border border-brand-gold/10 group-hover:bg-white transition-all shadow-sm">
            {row.chit_members?.profiles?.full_name?.[0] || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-[#2B2620] leading-none mb-1">{row.chit_members?.profiles?.full_name}</span>
            <span className="text-[10px] text-brand-text/30 font-bold tracking-widest uppercase">{row.chits?.name}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Settlement Yield', 
      render: (row) => (
        <div>
          <span className="font-bold text-[#2B2620] block leading-none mb-1">₹{Number(row.payout_amount).toLocaleString()}</span>
          <span className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest italic">Net matured value</span>
        </div>
      )
    },
    { 
      header: 'Audit Status', 
      render: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'Ref ID', 
      render: (row) => <span className="font-mono text-[10px] text-brand-text/30 font-bold uppercase tracking-tighter">MAT-{row.id.slice(0, 8).toUpperCase()}</span> 
    }
  ]

  return <DataTable columns={columns} data={payouts} loading={loading} />
}

export default PayoutTable
