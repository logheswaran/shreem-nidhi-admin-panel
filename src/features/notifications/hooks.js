import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Mock storage for notifications since no backend table provided
let mockNotifications = [
  { id: 1, title: 'Month 5 Generation', message: 'Contributions for Month 5 are now open for Platinum 5L.', target: 'Platinum 5L Members', status: 'delivered', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 2, title: 'Loan Disbursement', message: 'Your credit request for ₹50,000 has been approved.', target: 'Member: Logheswaran', status: 'delivered', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
]

/**
 * Hook for fetching notification history with smart caching.
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return [...mockNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

/**
 * Hook for sending new broadcasts.
 */
export const useNotificationActions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      await new Promise(resolve => setTimeout(resolve, 800))
      const newNotif = {
        id: Date.now(),
        ...payload,
        status: 'delivered',
        created_at: new Date().toISOString()
      }
      mockNotifications = [newNotif, ...mockNotifications]
      return newNotif
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Broadcast transmitted successfully!')
    },
    onError: () => {
      toast.error('Failed to dispatch broadcast')
    }
  })
}
