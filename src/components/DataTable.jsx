import React from 'react'

const DataTable = ({ columns, data = [], loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-brand-gold/10">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-brand-gold font-headline font-medium animate-pulse">Fetching records...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-brand-gold/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body border-collapse">
          <thead>
            <tr className="bg-surface-container/30">
              {columns.map((col, idx) => (
                <th key={idx} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-goldDark/70 border-b border-brand-gold/5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gold/5">
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-all duration-200 group ${onRowClick ? 'cursor-pointer hover:bg-brand-ivory/40' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-8 py-5 text-sm text-brand-text/80 group-hover:text-brand-navy">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <div className="w-16 h-16 bg-brand-ivory rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-4xl">folder_off</span>
                    </div>
                    <p className="text-brand-text font-headline italic">No records found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
