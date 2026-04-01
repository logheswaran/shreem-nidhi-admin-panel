import React from 'react'
import { Download, FileText } from 'lucide-react'
import { format } from 'date-fns'
import DataTable from '../../../shared/components/ui/DataTable'
import { getFullLedger } from '../api'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import toast from 'react-hot-toast'

const LedgerTable = ({ ledgerData, isLoading }) => {
  const handleExport = async () => {
    try {
      const toastId = toast.loading('Extracting ledger records...')
      const fullData = await getFullLedger()
      
      const csvData = fullData.map(record => ({
        'Transaction ID': record.id,
        'Date': format(new Date(record.created_at), 'dd MMM yyyy HH:mm'),
        'Type': record.transaction_type.toUpperCase(),
        'Reference': record.reference_type,
        'Amount (INR)': Number(record.amount).toFixed(2),
        'Status': record.status
      }))

      // Standard CSV export pattern if exportUtils doesn't have a direct default export
      // Assuming exportCSV might be an object, or just a function
      // If it fails, we fall back to manual export
      const headers = Object.keys(csvData[0]).join(',')
      const rows = csvData.map(obj => 
        Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      
      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SREEMNIDHI_LEDGER_EXPORT_${format(new Date(), 'yyyyMMdd')}.csv`
      a.click()
      
      toast.success('Ledger exported securely.', { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error('Export failed. Please try again.')
    }
  }

  const columns = [
    { 
      header: 'Txn ID', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center">
            <FileText className="w-4 h-4 text-brand-navy/50" />
          </div>
          <div>
            <p className="font-headline font-bold text-brand-navy">{row.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Type & Ref', 
      render: (row) => (
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
            row.transaction_type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {row.transaction_type}
          </span>
          <p className="text-[10px] text-brand-text/50 font-bold uppercase tracking-widest mt-2">{row.reference_type}</p>
        </div>
      )
    },
    { 
      header: 'Amount', 
      render: (row) => (
        <span className={`font-bold font-headline ${row.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.transaction_type === 'credit' ? '+' : '-'}₹{Number(row.amount).toLocaleString()}
        </span>
      )
    },
    { 
      header: 'Date', 
      render: (row) => (
        <span className="text-xs font-bold text-brand-text/70">{format(new Date(row.created_at), 'dd MMM yy')}</span>
      ) 
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ]

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 overflow-hidden shadow-sm">
      <div className="p-6 md:p-8 border-b border-brand-gold/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-xl font-bold text-brand-navy">General Ledger</h3>
          <p className="text-xs text-brand-text/50 mt-1 font-body">Recent 10 chronological entries</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-brand-navy/5 text-brand-navy px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-navy hover:text-white transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV Ledger
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={ledgerData} 
        loading={isLoading}
      />
    </div>
  )
}

export default LedgerTable
