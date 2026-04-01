import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getChits,
  getActiveAuctionRound,
  startMonth,
  selectWinner,
  openAuction,
  closeAuction,
  processMaturity
} from './api'

// --- QUERIES --- //

export const useChits = (filterStatus = 'all', searchQuery = '') => {
  return useQuery({
    queryKey: ['chits', filterStatus, searchQuery],
    queryFn: async () => {
      let data = await getChits()

      if (filterStatus !== 'all') {
        data = data.filter(c => c.status === filterStatus)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        data = data.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.id.toLowerCase().includes(query)
        )
      }

      return data
    },
    // Auto refresh chits table frequently since multiple admins might be working
    refetchInterval: 30000 
  })
}

// --- MUTATIONS --- //

export const useChitActions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ actionType, payload }) => {
      // Payload for closeAuction is chitId since we do backend lookup
      const { chitId, month } = payload
      
      switch (actionType) {
        case 'startMonth':
          return startMonth(chitId)
        
        case 'winner':
          return selectWinner(chitId)
        
        case 'openAuction':
          return openAuction(chitId, month)
        
        case 'closeAuction': {
          const auctionRoundId = await getActiveAuctionRound(chitId)
          if (!auctionRoundId) {
            throw new Error('No open auction round found for this chit.')
          }
          return closeAuction(auctionRoundId)
        }
        
        case 'maturity':
          return processMaturity(chitId)
          
        default:
          throw new Error('Unknown chit action')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })

      const msgs = {
        startMonth: 'Cycle Month initiated successfully.',
        winner: 'Winner successfully declared!',
        openAuction: 'Auction successfully launched.',
        closeAuction: 'Auction rounded closed & settled.',
        maturity: 'Protocol matured successfully.',
      }
      toast.success(msgs[variables.actionType])
    },
    onError: (error) => {
      console.error('RPC Controller Error:', error)
      toast.error(`Operation Failed: ${error.message || 'Check database.'}`)
    }
  })
}
