import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../../core/lib/supabase'
import { memberService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for managing member state with React Query for smart caching.
 */
export const useMembers = () => {
  const queryClient = useQueryClient()

  // 1. DATA QUERY (WITH NO CACHING FOR DEBUGGING)
  const { data: members = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: memberService.getMembers,
    staleTime: 0, // Force fresh data every time
  })

  // 2. ADD MEMBER MUTATION
  const addMutation = useMutation({
    mutationFn: memberService.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['defaulters'] })
      toast.success('Member enrolled successfully')
    },
    onError: (err) => {
      console.error('Enrollment error:', err)
      toast.error(err.message || 'Failed to enroll member')
    }
  })

  // 3. EDIT MEMBER MUTATION
  const editMutation = useMutation({
    mutationFn: ({ id, updates }) => memberService.updateMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['defaulters'] })
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
      queryClient.invalidateQueries({ queryKey: ['defaulters'] })
      toast.success('Member removed from directory')
    },
    onError: (err) => {
      console.error('Delete error:', err)
      toast.error('Failed to remove member')
    }
  })

  // 5. MEMBER STATS QUERY
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['member-stats'],
    queryFn: () => memberService.getMemberStats(),
    staleTime: 0,
  })

  // 📡 REAL-TIME SUBSCRIPTION
  useEffect(() => {
    // Force refresh on mount only
    refetch()

    // Subscribe to changes
    const channel = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chit_members' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['members'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // Empty dependency array for "mount only"

  // DEBUG LOGGING
  useEffect(() => {
    console.log('📊 MEMBERS UPDATED IN HOOK:', members)
  }, [members])

  return {
    members,
    stats,
    statsLoading,
    loading,
    error,
    addMember: (payload) => addMutation.mutateAsync(payload),
    editMember: (id, updates) => editMutation.mutateAsync({ id, updates }),
    removeMember: (id) => removeMutation.mutateAsync(id),
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member-stats'] })
    }
  }
}
