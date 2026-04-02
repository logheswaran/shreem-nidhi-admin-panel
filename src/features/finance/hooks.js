import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from './api'
import { chitService } from '../chits/api'
import toast from 'react-hot-toast'

/**
 * Hook for fetching active chits for operations.
 */
export const useActiveChits = () => {
  return useQuery({
    queryKey: ['active_chits'],
    queryFn: async () => {
      const data = await chitService.getChits()
      return data.filter(c => c.status === 'active')
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for monthly operations (Next Month, Winner selection).
 */
export const useMonthlyOperations = () => {
  const queryClient = useQueryClient()

  const generateMonth = useMutation({
    mutationFn: (chitId) => financeService.createMonthContributions(chitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_chits'] })
      queryClient.invalidateQueries({ queryKey: ['chits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Successfully initialized next month cycle!')
    },
    onError: (err) => {
      toast.error(err.message || 'Operation failed')
    }
  })

  const selectWinner = useMutation({
    mutationFn: (chitId) => financeService.selectWinner(chitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_chits'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Winner selected and ledger updated!')
    },
    onError: (err) => {
      toast.error(err.message || 'Winner selection failed')
    }
  })

  return {
    generateMonth: generateMonth.mutateAsync,
    selectWinner: selectWinner.mutateAsync,
    isProcessing: generateMonth.isLoading || selectWinner.isLoading
  }
}

/**
 * Hook for maturity payouts and settlements.
 */
export const usePayouts = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['payouts'],
    queryFn: financeService.getMaturityPayouts,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })

  const settlement = useMutation({
    mutationFn: (chitId) => financeService.processMaturity(chitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
      queryClient.invalidateQueries({ queryKey: ['active_chits'] })
      queryClient.invalidateQueries({ queryKey: ['chits'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Maturity processed! Ledger updated and scheme closed.')
    },
    onError: (err) => {
      toast.error(err.message || 'Settlement failed')
    }
  })

  return {
    ...query,
    processMaturity: settlement.mutateAsync,
    isSettling: settlement.isLoading
  }
}
