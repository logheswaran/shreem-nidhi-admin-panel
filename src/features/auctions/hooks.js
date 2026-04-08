import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auctionService, cancelAuction as cancelAuctionRpc } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for fetching auction rounds for a specific chit.
 */
export const useAuctionRounds = (chitId, page = 0, pageSize = 50) => {
  return useQuery({
    queryKey: ['auction_rounds', chitId, page, pageSize],
    queryFn: () => auctionService.getAuctionRounds(chitId, { page, pageSize }),
    enabled: !!chitId,
    staleTime: 1000 * 30, // 30 seconds freshness for live auctions
    cacheTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for fetching bids for a specific round.
 */
export const useBids = (roundId) => {
  return useQuery({
    queryKey: ['bids', roundId],
    queryFn: () => auctionService.getBids(roundId),
    enabled: !!roundId,
    staleTime: 1000 * 10, // 10 seconds freshness for bidding battle
    cacheTime: 1000 * 60 * 5,
  })
}

/**
 * Hook for auction actions (Open, Close, Bid).
 */
export const useAuctionActions = () => {
  const queryClient = useQueryClient()

  const closeMutation = useMutation({
    mutationFn: (roundId) => auctionService.closeAuction(roundId),
    onSuccess: (_, roundId) => {
      queryClient.invalidateQueries({ queryKey: ['auction_rounds'] })
      queryClient.invalidateQueries({ queryKey: ['bids', roundId] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Auction closed! Laureate admitted and dividends distributed.')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to close auction')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (roundId) => cancelAuctionRpc(roundId),
    onSuccess: (_, roundId) => {
      queryClient.invalidateQueries({ queryKey: ['auction_rounds'] })
      queryClient.invalidateQueries({ queryKey: ['bids', roundId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Auction cancelled.')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel auction')
    }
  })

  const openMutation = useMutation({
    mutationFn: ({ chitId, month }) => auctionService.openAuction(chitId, month),
    onSuccess: (_, { chitId }) => {
      queryClient.invalidateQueries({ queryKey: ['auction_rounds', chitId] })
      toast.success('Auction successfully launched.')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to open auction')
    }
  })

  return {
    closeAuction: closeMutation.mutateAsync,
    openAuction: openMutation.mutateAsync,
    cancelAuction: cancelMutation.mutateAsync,
    isProcessing: closeMutation.isLoading || openMutation.isLoading || cancelMutation.isLoading
  }
}
