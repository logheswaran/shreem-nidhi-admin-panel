import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for fetching notification history with smart caching.
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      return notificationService.getNotifications()
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

  const sendMutation = useMutation({
    mutationFn: (payload) => notificationService.sendNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Broadcast transmitted successfully!')
    },
    onError: () => {
      toast.error('Failed to dispatch broadcast')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => notificationService.updateNotification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Broadcast updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update broadcast')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Broadcast removed successfully!')
    },
    onError: () => {
      toast.error('Failed to remove broadcast')
    }
  })

  const resendMutation = useMutation({
    mutationFn: (notification) => notificationService.resendFailed(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Failed transmissions resent successfully!')
    },
    onError: () => {
      toast.error('Failed to resend transmission')
    }
  })

  return {
    mutateAsync: sendMutation.mutateAsync,
    sendBroadcast: sendMutation.mutateAsync,
    updateBroadcast: updateMutation.mutateAsync,
    deleteBroadcast: deleteMutation.mutateAsync,
    resendFailed: resendMutation.mutateAsync,
    isLoading: sendMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading || resendMutation.isLoading
  }
}
