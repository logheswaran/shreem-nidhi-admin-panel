import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for managing contributions with React Query.
 */
export const useContributions = (chitId, month, page = 0, pageSize = 25) => {
  return useQuery({
    queryKey: ['contributions', chitId, month, page, pageSize],
    queryFn: () => financeService.getContributions(chitId, month, { page, pageSize }),
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook for contribution mutations.
 */
export const useContributionActions = () => {
  const queryClient = useQueryClient()

  // 1. Record payment (RPC)
  const recordPayment = useMutation({
    mutationFn: ({ memberId, month, amount, paymentMode, paymentRef }) => 
      financeService.recordContribution(memberId, month, amount, paymentMode, paymentRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      queryClient.invalidateQueries({ queryKey: ['active_chits'] })
      toast.success('Payment verified successfully!')
    },
    onError: (err) => {
      toast.error(err.message || 'Payment verification failed')
    }
  })

  // 2. Mark Failed
  const markFailed = useMutation({
    mutationFn: ({ id, reason }) => financeService.markContributionFailed(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] })
      toast.success('Contribution marked as failed')
    },
    onError: (err) => {
      toast.error(err.message || 'Action failed')
    }
  })

  // 3. Mark Waived
  const markWaived = useMutation({
    mutationFn: ({ id, reason }) => financeService.markContributionWaived(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] })
      toast.success('Contribution waived')
    },
    onError: (err) => {
      toast.error(err.message || 'Action failed')
    }
  })

  // 4. Generic Update
  const updateContribution = useMutation({
    mutationFn: ({ id, updates }) => financeService.updateContribution(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] })
      toast.success('Contribution updated')
    },
    onError: (err) => {
      toast.error(err.message || 'Update failed')
    }
  })

  return {
    recordPayment: recordPayment.mutateAsync,
    markFailed: markFailed.mutateAsync,
    markWaived: markWaived.mutateAsync,
    updateContribution: updateContribution.mutateAsync,
    isProcessing: recordPayment.isLoading || markFailed.isLoading || markWaived.isLoading || updateContribution.isLoading
  }
}
