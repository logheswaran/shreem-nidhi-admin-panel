import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentService } from './api'
import toast from 'react-hot-toast'

export const useAgents = () => {
  const queryClient = useQueryClient()

  // 1. Fetch agents list
  const { data: agents = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['agents'],
    queryFn: agentService.getAgents,
    staleTime: 1000 * 60 * 1,
  })

  // 2. Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ agentId, status }) => agentService.updateAgentStatus(agentId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agent-details', variables.agentId] })
      queryClient.invalidateQueries({ queryKey: ['commission-log'] })
      toast.success(`Agent ${variables.status === 'active' ? 'approved' : variables.status}`)
    },
    onError: (err) => {
      console.error('Status update error:', err)
      toast.error(err.message || 'Failed to update agent status')
    }
  })

  // 3. Create agent mutation
  const createMutation = useMutation({
    mutationFn: (profileId) => agentService.createAgent(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent registered successfully')
    },
    onError: (err) => {
      console.error('Agent creation error:', err)
      toast.error(err.message || 'Failed to register agent')
    }
  })

  // 4. Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: (agentId) => agentService.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent removed from registry')
    },
    onError: (err) => {
      console.error('Agent deletion error:', err)
      toast.error(err.message || 'Failed to remove agent')
    }
  })

  return {
    agents,
    loading,
    error,
    refetch,
    updateStatus: (agentId, status) => updateStatusMutation.mutateAsync({ agentId, status }),
    createAgent: (profileId) => createMutation.mutateAsync(profileId),
    deleteAgent: (agentId) => deleteMutation.mutateAsync(agentId),
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

export const useAgentDetails = (agentId) => {
  // Fetch agent details
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['agent-details', agentId],
    queryFn: () => agentService.getAgentById(agentId),
    enabled: !!agentId,
  })

  // Fetch referrals
  const { data: referrals = [], isLoading: referralsLoading } = useQuery({
    queryKey: ['agent-referrals', agentId],
    queryFn: () => agentService.getAgentReferrals(agentId),
    enabled: !!agentId,
  })

  // Fetch commissions
  const { data: commissions = [], isLoading: commissionsLoading } = useQuery({
    queryKey: ['agent-commissions', agentId],
    queryFn: () => agentService.getAgentCommissions(agentId),
    enabled: !!agentId,
  })

  return {
    detail,
    referrals,
    commissions,
    loading: detailLoading || referralsLoading || commissionsLoading,
  }
}

export const useCommissionLog = () => {
  const { data: commissionLog = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['commission-log'],
    queryFn: agentService.getCommissionLog,
    staleTime: 1000 * 60 * 1,
  })

  return {
    commissionLog,
    loading,
    error,
    refetch
  }
}
