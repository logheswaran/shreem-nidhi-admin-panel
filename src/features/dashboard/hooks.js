import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getDashboardStats,
  getRecentLedger,
  startMonth,
  selectWinner,
  openAuction,
  closeAuction,
  processMaturity
} from './api'

// --- QUERIES --- //

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: getDashboardStats,
    // Bonus Requirement: Auto-refresh every 30 seconds
    refetchInterval: 30000, 
    staleTime: 1000 * 20, // Only consider stale after 20s
  })
}

export const useRecentLedger = () => {
  return useQuery({
    queryKey: ['recent_ledger'],
    queryFn: getRecentLedger,
    refetchInterval: 30000,
  })
}

// --- MUTATIONS --- //

export const useDashboardActions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ type, payload }) => {
      switch (type) {
        case 'startMonth':
          return startMonth(payload)
        case 'winner':
          return selectWinner(payload)
        case 'openAuction':
          return openAuction(payload.chitId, payload.month)
        case 'closeAuction':
          return closeAuction(payload)
        case 'maturity':
          return processMaturity(payload)
        default:
          throw new Error('Unknown action type provided to useDashboardActions')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent_ledger'] })
      
      const successMessages = {
        startMonth: 'Month started and contributions created successfully.',
        winner: 'Winner successfully selected!',
        openAuction: 'Auction manually opened.',
        closeAuction: 'Auction closed and dividends distributed.',
        maturity: 'Processing maturity completed.',
      }
      
      toast.success(successMessages[variables.type] || 'Action completed successfully!')
    },
    onError: (err) => {
      console.error('RPC Error:', err)
      toast.error(`Operation failed: ${err.message || 'Check database.'}`)
    }
  })
}
