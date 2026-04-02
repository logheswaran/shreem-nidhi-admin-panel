import { useState, useEffect, useCallback, useMemo } from 'react'
import { financeService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for managing ledger state with optimistic updates and computed statistics.
 */
export const useLedger = () => {
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true)
      const data = await financeService.getLedger()
      setLedger(data)
      setError(null)
    } catch (err) {
      setError(err)
      toast.error('Failed to sync institutional ledger')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  /**
   * Computed stats for the ledger
   */
  const stats = useMemo(() => {
    const totalCredit = ledger
      .filter(l => l.transaction_type === 'credit')
      .reduce((sum, l) => sum + Number(l.amount), 0)
    
    const totalDebit = ledger
      .filter(l => l.transaction_type === 'debit')
      .reduce((sum, l) => sum + Number(l.amount), 0)
    
    // Sort by date (oldest first) to compute accurate running balance
    const sorted = [...ledger].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let current = 0
    const runningBalances = {}
    sorted.forEach(l => {
      const amount = Number(l.amount)
      if (l.transaction_type === 'credit') {
        current += amount
      } else {
        current -= amount
      }
      runningBalances[l.id] = current
    })

    return { 
      totalCredit, 
      totalDebit, 
      balance: totalCredit - totalDebit,
      runningBalances
    }
  }, [ledger])

  /**
   * Optimistically add a ledger entry
   */
  const addEntry = async (payload) => {
    const tempId = 'temp-' + Date.now()
    const optimistic = { 
      id: tempId, 
      ...payload, 
      created_at: payload.created_at || new Date().toISOString(),
      profiles: payload.full_name ? { full_name: payload.full_name } : null,
      chits: null // We don't have chit name easily available here without more lookups
    }
    
    setLedger(prev => [optimistic, ...prev])
    
    try {
      const real = await financeService.createLedgerEntry(payload)
      setLedger(prev => prev.map(l => l.id === tempId ? real : l))
      toast.success('Ledger entry recorded')
      return real
    } catch (err) {
      setLedger(prev => prev.filter(l => l.id !== tempId))
      toast.error('Failed to record entry')
      throw err
    }
  }

  /**
   * Optimistically update a ledger entry
   */
  const editEntry = async (id, updates) => {
    const previousLedger = [...ledger]
    setLedger(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    
    try {
      const updated = await financeService.updateLedgerEntry(id, updates)
      setLedger(prev => prev.map(l => l.id === id ? updated : l))
      toast.success('Ledger entry updated')
      return updated
    } catch (err) {
      setLedger(previousLedger)
      toast.error('Failed to update entry')
      throw err
    }
  }

  /**
   * Optimistically remove a ledger entry
   */
  const removeEntry = async (id) => {
    const previousLedger = [...ledger]
    setLedger(prev => prev.filter(l => l.id !== id))
    
    try {
      await financeService.deleteLedgerEntry(id)
      toast.success('Entry removed from ledger')
    } catch (err) {
      setLedger(previousLedger)
      toast.error('Failed to delete entry')
      throw err
    }
  }

  return {
    ledger,
    loading,
    error,
    stats,
    addEntry,
    editEntry,
    removeEntry,
    refetch: fetchLedger
  }
}
