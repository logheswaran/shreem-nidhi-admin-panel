import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { memberService } from '../members/api'
import toast from 'react-hot-toast'

/**
 * Hook for managing member applications with smart caching.
 */
export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: memberService.getApplications,
    staleTime: 1000 * 60 * 2, // 2 minutes freshness
    cacheTime: 1000 * 60 * 5, // 5 minutes in memory (reduced for memory optimization)
  })
}

/**
 * Hook for application actions (approve/reject).
 */
export const useApplicationActions = () => {
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: (id) => memberService.approveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      toast.success('Member admitted to trust successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Admission failed')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => memberService.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application rejected and archived')
    },
    onError: (err) => {
      toast.error(err.message || 'Rejection failed')
    }
  })

  const requestInfoMutation = useMutation({
    mutationFn: ({ id, message }) => memberService.requestMoreInfo(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Information request sent to applicant')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send request')
    }
  })

  return {
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    requestInfo: requestInfoMutation.mutateAsync,
    isLoading: approveMutation.isLoading || rejectMutation.isLoading || requestInfoMutation.isLoading
  }
}
