import React, { useEffect, useState } from 'react'
import { Fingerprint, Lock, Unlock } from 'lucide-react'
import { adminService } from '../api'
import { writeAuditLog } from '../../../shared/utils/writeAuditLog'
import DataTable from '../../../shared/components/ui/DataTable'
import toast from 'react-hot-toast'

const RolesTab = ({ searchTerm = '' }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await adminService.getProfiles()
      setData(result)
    } catch (error) {
      toast.error('Failed to load security delegates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleRole = async (user) => {
    const newRole = user.role_type === 'admin' ? 'member' : 'admin'
    try {
      setIsProcessing(true)
      toast.loading(`Updating security clearance for ${user.full_name}...`, { id: 'role' })
      await adminService.updateRole(user.id, newRole)
      toast.success('Clearance updated!', { id: 'role' })
      
      // Audit log: role change is a critical mutation
      await writeAuditLog({
        action: `ROLE_CHANGE_TO_${newRole.toUpperCase()}`,
        tableName: 'profiles',
        recordId: user.id
      })

      fetchData()
    } catch (error) {
      toast.error(error.message || 'Update failed', { id: 'role' })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredData = data.filter(item => {
    const searchStr = (item.full_name || '').toLowerCase()
    return searchStr.includes(searchTerm.toLowerCase())
  })

  const columns = [
    { 
      header: 'Security Delegate', 
      render: (row) => (
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-brand-gold/5 flex items-center justify-center text-brand-gold border border-brand-gold/10">
              <Fingerprint className="w-5 h-5" />
           </div>
           <div className="flex flex-col text-left">
             <span className="font-bold text-[#2B2620]">{row.full_name}</span>
             <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest leading-none">{row.mobile_number}</span>
           </div>
        </div>
      )
    },
    { 
      header: 'Clearance Matrix', 
      render: (row) => (
        <div className="flex gap-1">
           {['Auctions', 'Payments', 'Ledger'].map(mod => (
             <div key={mod} className={`w-2.5 h-2.5 rounded-full ${row.role_type === 'admin' ? 'bg-green-500' : 'bg-brand-gold/20'}`} title={`${mod} Access`}></div>
           ))}
        </div>
      )
    },
    { 
      header: 'Action', 
      render: (row) => (
        <button 
          disabled={isProcessing}
          onClick={() => handleToggleRole(row)}
          className="bg-brand-ivory disabled:opacity-60 disabled:cursor-not-allowed text-[#2B2620] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-brand-gold hover:text-white transition-all shadow-sm flex items-center gap-2"
        >
          {row.role_type === 'admin' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          Modify Role
        </button>
      )
    }
  ]

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden min-h-[500px]">
      <DataTable columns={columns} data={filteredData} loading={loading} />
    </div>
  )
}

export default RolesTab
