import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { memberService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for managing member state with React Query for smart caching.
 */
export const useMembers = () => {
  const queryClient = useQueryClient()

  // 1. DATA QUERY (WITH CACHING)
  const { data: members = [], isLoading: loading, error } = useQuery({
    queryKey: ['members'],
    queryFn: memberService.getMembers,
    staleTime: 1000 * 60 * 5, // 5 minutes cache freshness
    cacheTime: 1000 * 60 * 30, // 30 minutes in RAM
  })

  // 2. ADD MEMBER MUTATION
  const addMutation = useMutation({
    mutationFn: memberService.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member enrolled successfully')
    },
    onError: (err) => {
      console.error('Enrollment error:', err)
      toast.error('Failed to enroll member')
    }
  })

  // 3. EDIT MEMBER MUTATION
  const editMutation = useMutation({
    mutationFn: ({ id, updates }) => memberService.updateMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member records updated')
    },
    onError: (err) => {
      console.error('Update error:', err)
      toast.error('Failed to update records')
    }
  })

  // 4. REMOVE MEMBER MUTATION
  const removeMutation = useMutation({
    mutationFn: memberService.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member removed from directory')
    },
    onError: (err) => {
      console.error('Delete error:', err)
      toast.error('Failed to remove member')
    }
  })

  return {
    members,
    loading,
    error,
    addMember: (payload) => addMutation.mutateAsync(payload),
    editMember: (id, updates) => editMutation.mutateAsync({ id, updates }),
    removeMember: (id) => removeMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['members'] })
  }
}
