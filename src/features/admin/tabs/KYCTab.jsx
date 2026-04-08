import React, { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { adminService } from '../api'
import { writeAuditLog } from '../../../shared/utils/writeAuditLog'
import DataTable from '../../../shared/components/ui/DataTable'
import toast from 'react-hot-toast'

const KYCTab = ({ searchTerm = '' }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await adminService.getPendingKYC()
      setData(result)
    } catch (error) {
      toast.error('Failed to load KYC queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /**
   * FIX: Bug #5 — verifyKYC no longer accepts unused userId param.
   * Only kycId is needed since the query updates by kyc record ID.
   */
  const handleVerifyKYC = async (kyc) => {
    try {
      setIsProcessing(true)
      toast.loading('Verifying identity documents...', { id: 'kyc' })
      await adminService.verifyKYC(kyc.id)
      toast.success('Identity verified!', { id: 'kyc' })

      // Audit log: KYC verification
      await writeAuditLog({
        action: 'KYC_VERIFY',
        tableName: 'kyc_details',
        recordId: kyc.id
      })

      fetchData()
    } catch (error) {
      toast.error(error.message || 'Identity verification failed', { id: 'kyc' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectKYC = async (kyc) => {
    try {
      setIsProcessing(true)
      toast.loading('Rejecting KYC submission...', { id: 'kyc' })
      await adminService.rejectKYC(kyc.id)
      toast.success('KYC rejected', { id: 'kyc' })

      await writeAuditLog({
        action: 'KYC_REJECT',
        tableName: 'kyc_details',
        recordId: kyc.id
      })

      fetchData()
    } catch (error) {
      toast.error(error.message || 'KYC rejection failed', { id: 'kyc' })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredData = data.filter(item => {
    const searchStr = (item.profiles?.full_name || '').toLowerCase()
    return searchStr.includes(searchTerm.toLowerCase())
  })

  const columns = [
    { header: 'Applicant', render: (row) => <span className="font-bold text-[#2B2620]">{row.profiles?.full_name}</span> },
    { header: 'Identification', render: (row) => <span className="font-mono text-[10px] text-brand-gold">ID: XXXX-XXXX-{row.aadhaar_number?.slice(-4)}</span> },
    { 
      header: 'Compliance Action', 
      render: (row) => (
        <div className="flex items-center gap-4">
           <button disabled={isProcessing} onClick={() => handleVerifyKYC(row)} className="text-green-600 disabled:opacity-60 disabled:cursor-not-allowed hover:text-green-700 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Approve</button>
           <button disabled={isProcessing} onClick={() => handleRejectKYC(row)} className="text-red-600 disabled:opacity-60 disabled:cursor-not-allowed hover:text-red-700 font-bold flex items-center gap-1"><X className="w-4 h-4" /> Reject</button>
        </div>
      )
    }
  ]

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-gold/10 shadow-2xl overflow-hidden min-h-[500px]">
      <DataTable columns={columns} data={filteredData} loading={loading} />
    </div>
  )
}

export default KYCTab
