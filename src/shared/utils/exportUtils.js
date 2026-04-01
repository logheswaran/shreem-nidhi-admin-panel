/**
 * Export Utility for SreemNidhi Admin Panel
 * Supports CSV export and a print-friendly view for PDF generation.
 */

/**
 * Export data as CSV and trigger download
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<{header: string, accessor: string}>} columns - Column definitions
 * @param {string} filename - Base filename (without extension)
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) return

  // Build header row
  const headers = columns.map(col => col.header)
  
  // Build data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = col.accessor ? row[col.accessor] : ''
      // Escape CSV special characters
      const escaped = String(value || '').replace(/"/g, '""')
      return `"${escaped}"`
    })
  })

  // Combine header + rows
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n')

  // Create BOM for Excel compatibility with Unicode
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate a print-friendly HTML table and trigger the browser print dialog (for PDF)
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<{header: string, accessor: string}>} columns - Column definitions  
 * @param {string} title - Report title to display in the header
 */
export const exportToPDF = (data, columns, title = 'SreemNidhi Report') => {
  if (!data || data.length === 0) return

  const headerRow = columns.map(col => `<th style="padding:12px 16px;text-align:left;border-bottom:2px solid #C49A1A;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#3D3826">${col.header}</th>`).join('')
  
  const bodyRows = data.map(row => {
    const cells = columns.map(col => {
      const value = col.accessor ? row[col.accessor] : ''
      return `<td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:12px;color:#3D3826">${value || '-'}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #3D3826; }
        .header { border-bottom: 3px solid #C49A1A; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-family: 'Noto Serif Display', serif; font-size: 28px; color: #1C2536; margin: 0; }
        .header p { font-size: 12px; color: #888; margin-top: 6px; }
        table { width: 100%; border-collapse: collapse; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &bull; SreemNidhi Admin Portal</p>
      </div>
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <div class="footer">
        This is an auto-generated document from the SreemNidhi Heritage Trust Administration system. &copy; ${new Date().getFullYear()}
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}
