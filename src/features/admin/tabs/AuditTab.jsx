import React, { useEffect, useMemo, useState } from 'react'
import { adminService } from '../api'
import DataTable from '../../../shared/components/ui/DataTable'
import toast from 'react-hot-toast'

const AuditTab = ({ searchTerm = '' }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [actionFilter, setActionFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('all')
  const pageSize = 50

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await adminService.getAuditLogs({ page, pageSize })
      setData(result)
    } catch (error) {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const action = (item.action || '').toLowerCase()
      const table = (item.table_name || '').toLowerCase()
      const query = searchTerm.toLowerCase()

      const matchesSearch = action.includes(query) || table.includes(query)
      const matchesAction = actionFilter === 'all' || action === actionFilter
      const matchesTable = tableFilter === 'all' || table === tableFilter

      return matchesSearch && matchesAction && matchesTable
    })
  }, [data, searchTerm, actionFilter, tableFilter])

  const actionOptions = useMemo(() => {
    return ['all', ...new Set(data.map(item => (item.action || '').toLowerCase()).filter(Boolean))]
  }, [data])

  const tableOptions = useMemo(() => {
    return ['all', ...new Set(data.map(item => (item.table_name || '').toLowerCase()).filter(Boolean))]
  }, [data])

  const columns = [
    { header: 'Event Code', render: (row) => <span className="font-mono text-[10px] text-brand-gold">EVT-{row.id.slice(0,8).toUpperCase()}</span> },
    { header: 'Target Table', render: (row) => <span className="text-xs font-bold text-[#2B2620] uppercase tracking-widest">{row.table_name}</span> },
    { header: 'Action', render: (row) => <span className="text-sm font-bold text-brand-text/60">{row.action}</span> },
    { header: 'Timestamp', render: (row) => <span className="text-[10px] font-bold text-brand-text/30">{new Date(row.created_at).toLocaleString()}</span> }
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-brand-gold/10 bg-white text-xs font-bold uppercase tracking-widest text-[#2B2620] shadow-sm"
        >
          {actionOptions.map(option => (
            <option key={option} value={option}>
              {option === 'all' ? 'All actions' : option.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-brand-gold/10 bg-white text-xs font-bold uppercase tracking-widest text-[#2B2620] shadow-sm"
        >
          {tableOptions.map(option => (
            <option key={option} value={option}>
              {option === 'all' ? 'All tables' : option.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden min-h-[500px]">
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            page === 0 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white text-[#2B2620] border border-brand-gold/10 hover:bg-brand-gold/5 shadow-sm'
          }`}
        >
          Previous
        </button>
        <div className="flex items-center px-4 py-2.5 bg-white rounded-xl border border-brand-gold/10 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Page {page + 1}</span>
        </div>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={data.length < pageSize}
          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            data.length < pageSize 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white text-[#2B2620] border border-brand-gold/10 hover:bg-brand-gold/5 shadow-sm'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AuditTab
