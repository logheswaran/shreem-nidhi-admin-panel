import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getChits,
  getChitById,
  getChitFullDetails,
  getActiveAuctionRound,
  createChit,
  updateChit,
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
    refetchInterval: 60000, // Sync every minute
    staleTime: 30000
  })
}

export const useChitDetails = (id) => {
  return useQuery({
    queryKey: ['chit', id],
    queryFn: () => getChitFullDetails(id),
    enabled: !!id,
    staleTime: 30000
  })
}

// --- MUTATIONS --- //

export const useCreateChit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createChit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chits'] })
      toast.success('Chit protocol initialized successfully.')
    },
    onError: (err) => {
      toast.error(`Creation failed: ${err.message}`)
    }
  })
}

export const useUpdateChit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => updateChit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chits'] })
      queryClient.invalidateQueries({ queryKey: ['chit'] })
      toast.success('Chit protocol updated successfully.')
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`)
    }
  })
}

export const useChitActions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ actionType, payload }) => {
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
      const chitId = variables.payload?.chitId
      // Invalidate both listing and specific detail caches
      queryClient.invalidateQueries({ queryKey: ['chits'] })
      if (chitId) {
        queryClient.invalidateQueries({ queryKey: ['chit', chitId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['chit'] })
      }
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
