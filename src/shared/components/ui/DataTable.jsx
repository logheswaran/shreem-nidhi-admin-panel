import React, { useState, useMemo, memo } from 'react'
import { ChevronLeft, ChevronRight, Inbox, ArrowUpDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// MEMOIZED ROW COMPONENT (Optimizes rendering performance)
const DataRow = memo(({ row, columns, rowIdx, onRowClick }) => (
  <motion.tr 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, delay: Math.min(rowIdx * 0.03, 0.3) }}
    onClick={() => onRowClick && onRowClick(row)}
    className={`transition-all duration-200 group border-b border-brand-gold/5 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-brand-gold/[0.02]' : ''}`}
  >
    {columns.map((col, colIdx) => (
      <td key={colIdx} className="px-8 py-5 text-sm text-brand-text/80 group-hover:text-[#2B2620]">
        {col.render ? col.render(row) : row[col.accessor]}
      </td>
    ))}
  </motion.tr>
))

DataRow.displayName = 'DataRow'

const DataTable = ({ columns, data = [], loading, onRowClick, pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [data, sortConfig])

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Skeleton Loader Component
  const Skeleton = () => (
    <div className="w-full animate-pulse px-8 py-5">
      <div className="h-4 bg-brand-gold/5 rounded-full w-full mb-2"></div>
      <div className="h-3 bg-brand-gold/5 rounded-full w-2/3"></div>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] border border-brand-gold/10 overflow-hidden soft-glow">
        <div className="h-16 bg-surface-container/30 border-b border-brand-gold/5"></div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 group/table">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-brand-gold/10 overflow-hidden soft-glow relative transition-all duration-500">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left font-body border-collapse">
            <thead>
              <tr className="bg-surface-container/30">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    onClick={() => col.accessor && requestSort(col.accessor)}
                    className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-goldDark/50 border-b border-brand-gold/5 ${col.accessor ? 'cursor-pointer hover:text-brand-gold transition-colors' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.accessor && <ArrowUpDown className="w-3 h-3 opacity-20" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5">
              <AnimatePresence mode="popLayout" initial={false}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIdx) => (
                    <DataRow 
                      key={row.id || rowIdx}
                      row={row}
                      columns={columns}
                      rowIdx={rowIdx}
                      onRowClick={onRowClick}
                    />
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center opacity-30 grayscale contrast-75">
                        <Inbox className="w-16 h-16 text-brand-gold mb-6 stroke-[1]" />
                        <p className="text-[#2B2620] font-headline text-lg font-bold italic">The vault is currently empty</p>
                        <p className="text-xs tracking-widest uppercase font-black mt-2">No relevant entries discovered</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-md rounded-full border border-brand-gold/10 soft-glow">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/30">Registry Navigation</p>
            <p className="text-xs font-bold text-[#2B2620]">
              Viewing <span className="text-brand-gold">{paginatedData.length}</span> of {sortedData.length} records
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2.5 rounded-full bg-white border border-brand-gold/10 text-[#2B2620] disabled:opacity-30 hover:bg-brand-gold/10 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-1">
               {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-[10px] font-black transition-all ${currentPage === i + 1 ? 'heritage-gradient text-white shadow-lg' : 'bg-white text-[#2B2620] border border-brand-gold/5 hover:bg-brand-gold/5'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2.5 rounded-full bg-white border border-brand-gold/10 text-[#2B2620] disabled:opacity-30 hover:bg-brand-gold/10 transition-all shadow-sm active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
