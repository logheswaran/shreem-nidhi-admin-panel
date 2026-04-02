import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { financeService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for managing ledger state with React Query for smart caching and computed statistics.
 */
export const useLedger = () => {
  const queryClient = useQueryClient()

  // 1. DATA QUERY (WITH CACHING)
  const { data: ledger = [], isLoading: loading, error } = useQuery({
    queryKey: ['ledger'],
    queryFn: financeService.getLedger,
    staleTime: 1000 * 60 * 5, // 5 minutes cache freshness
    cacheTime: 1000 * 60 * 30, // 30 minutes in RAM
  })

  // 2. COMPUTED STATS (MEMOIZED)
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

  // 3. MUTATIONS
  const addMutation = useMutation({
    mutationFn: financeService.createLedgerEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      toast.success('Ledger entry recorded')
    },
    onError: (err) => {
      console.error('Ledger add error:', err)
      toast.error('Failed to record entry')
    }
  })

  const editMutation = useMutation({
    mutationFn: ({ id, updates }) => financeService.updateLedgerEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      toast.success('Ledger entry updated')
    },
    onError: (err) => {
      console.error('Ledger edit error:', err)
      toast.error('Failed to update entry')
    }
  })

  const removeMutation = useMutation({
    mutationFn: financeService.deleteLedgerEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      toast.success('Entry removed from ledger')
    },
    onError: (err) => {
      console.error('Ledger delete error:', err)
      toast.error('Failed to delete entry')
    }
  })

  return {
    ledger,
    loading,
    error,
    stats,
    addEntry: (payload) => addMutation.mutateAsync(payload),
    editEntry: (id, updates) => editMutation.mutateAsync({ id, updates }),
    removeEntry: (id) => removeMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['ledger'] })
  }
}
