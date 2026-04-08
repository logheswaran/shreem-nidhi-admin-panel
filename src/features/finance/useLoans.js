import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for fetching and managing loans.
 */
export const useLoans = () => {
  const query = useQuery({
    queryKey: ['loans'],
    queryFn: financeService.getLoans,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return query
}

/**
 * Hook for loan mutations.
 */
export const useLoanActions = () => {
  const queryClient = useQueryClient()

  // 1. Issue Loan (RPC)
  const issueLoan = useMutation({
    mutationFn: ({ memberId, amount }) => financeService.issueLoan(memberId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Loan issued successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Loan issuance failed')
    }
  })

  // 2. Repay Loan (RPC)
  const repayLoan = useMutation({
    mutationFn: ({ loanId, amount }) => financeService.repayLoan(loanId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Repayment recorded successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Repayment failed')
    }
  })

  // 3. Close Loan
  const closeLoan = useMutation({
    mutationFn: ({ loanId, reason }) => financeService.closeLoan(loanId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      toast.success('Loan closed successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Closure failed')
    }
  })

  // 4. Write Off Loan
  const writeOffLoan = useMutation({
    mutationFn: ({ loanId, reason }) => financeService.writeOffLoan(loanId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      toast.warning('Loan written off as loss')
    },
    onError: (err) => {
      toast.error(err.message || 'Write-off failed')
    }
  })

  return {
    issueLoan: issueLoan.mutateAsync,
    repayLoan: repayLoan.mutateAsync,
    closeLoan: closeLoan.mutateAsync,
    writeOffLoan: writeOffLoan.mutateAsync,
    isProcessing: issueLoan.isLoading || repayLoan.isLoading || closeLoan.isLoading || writeOffLoan.isLoading
  }
}
