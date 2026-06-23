import { supabase } from '../../core/lib/supabase'

export const agentService = {
  /**
   * Fetch all agents with aggregate referral count and total commission.
   * Uses separate queries then merges client-side to avoid RLS join issues.
   */
  async getAgents() {
    try {
      // 1. Fetch agents with profile join
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select(`
          id,
          profile_id,
          status,
          kyc_verified,
          approved_by,
          approved_at,
          created_at,
          profiles:profile_id(id, full_name, mobile_number)
        `)
        .order('created_at', { ascending: false })

      if (agentsError) {
        console.error('📡 SUPABASE ERROR (getAgents - agents):', agentsError)
        throw agentsError
      }

      if (!agents || agents.length === 0) return []

      const agentIds = agents.map(a => a.id)

      // 2. Fetch all referrals for these agents
      const { data: referrals, error: refError } = await supabase
        .from('agent_referrals')
        .select('id, agent_id')
        .in('agent_id', agentIds)

      if (refError) {
        console.warn('⚠️ agent_referrals fetch failed (RLS?):', refError.message)
      }

      // 3. Fetch all commissions for these agents
      const { data: commissions, error: commError } = await supabase
        .from('agent_commissions')
        .select('agent_id, commission_amount')
        .in('agent_id', agentIds)

      if (commError) {
        console.warn('⚠️ agent_commissions fetch failed (RLS?):', commError.message)
      }

      // 4. Merge aggregates client-side
      return agents.map(agent => {
        const agentReferrals = (referrals || []).filter(r => r.agent_id === agent.id)
        const agentCommissions = (commissions || []).filter(c => c.agent_id === agent.id)
        return {
          id: agent.id,
          profile_id: agent.profile_id,
          status: agent.status,
          kyc_verified: agent.kyc_verified,
          approved_by: agent.approved_by,
          approved_at: agent.approved_at,
          created_at: agent.created_at,
          full_name: agent.profiles?.full_name || 'Unknown',
          mobile_number: agent.profiles?.mobile_number || 'N/A',
          total_referrals: agentReferrals.length,
          total_commission: agentCommissions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0),
          profile: agent.profiles
        }
      })
    } catch (e) {
      console.error('❌ Critical Agents Fetch Failure:', e)
      throw e
    }
  },

  /**
   * Fetch details for a specific agent
   */
  async getAgentById(agentId) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          id,
          profile_id,
          status,
          kyc_verified,
          approved_by,
          approved_at,
          created_at,
          profiles:profile_id(id, full_name, mobile_number)
        `)
        .eq('id', agentId)
        .single()

      if (error) throw error
      return data
    } catch (e) {
      console.error('❌ Critical Agent Detail Fetch Failure:', e)
      throw e
    }
  },

  /**
   * Fetch referrals with commissions for a specific agent.
   * Uses two separate queries and merges client-side.
   */
  async getAgentReferrals(agentId) {
    try {
      const { data: referrals, error: refError } = await supabase
        .from('agent_referrals')
        .select(`
          id,
          user_id,
          created_at,
          profiles:user_id(id, full_name, mobile_number)
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (refError) {
        console.error('📡 SUPABASE ERROR (getAgentReferrals):', refError)
        throw refError
      }

      const { data: commissions, error: commError } = await supabase
        .from('agent_commissions')
        .select(`
          user_id,
          commission_amount,
          commission_type,
          created_at,
          chits:chit_id(id, name, chit_type)
        `)
        .eq('agent_id', agentId)

      if (commError) {
        console.warn('⚠️ agent_commissions fetch failed:', commError.message)
      }

      return (referrals || []).map(ref => {
        const refComm = (commissions || []).find(c => c.user_id === ref.user_id)
        return {
          referred_at: ref.created_at,
          member_name: ref.profiles?.full_name || 'Unknown',
          mobile_number: ref.profiles?.mobile_number || 'N/A',
          chit_name: refComm?.chits?.name || '—',
          chit_type: refComm?.chits?.chit_type || '—',
          commission_amount: refComm?.commission_amount || 0,
          commission_type: refComm?.commission_type || '—',
          has_commission: !!refComm
        }
      })
    } catch (e) {
      console.error('❌ Critical Agent Referrals Fetch Failure:', e)
      throw e
    }
  },

  /**
   * Fetch commission history for a specific agent
   */
  async getAgentCommissions(agentId) {
    try {
      const { data, error } = await supabase
        .from('agent_commissions')
        .select(`
          id,
          commission_amount,
          commission_type,
          created_at,
          chits:chit_id(name)
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('📡 SUPABASE ERROR (getAgentCommissions):', error)
        throw error
      }

      return (data || []).map(ac => ({
        id: ac.id,
        commission_amount: ac.commission_amount,
        commission_type: ac.commission_type,
        created_at: ac.created_at,
        chit_name: ac.chits?.name || '—'
      }))
    } catch (e) {
      console.error('❌ Critical Agent Commissions Fetch Failure:', e)
      throw e
    }
  },

  /**
   * Fetch global commissions log across all agents
   */
  async getCommissionLog() {
    try {
      // Fetch commissions with separate agent + member profile lookups
      const { data, error } = await supabase
        .from('agent_commissions')
        .select(`
          id,
          agent_id,
          user_id,
          chit_id,
          commission_amount,
          commission_type,
          created_at,
          chits:chit_id(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('📡 SUPABASE ERROR (getCommissionLog):', error)
        throw error
      }

      if (!data || data.length === 0) return []

      // Collect unique agent_ids and user_ids for profile lookups
      const agentIds = [...new Set(data.map(d => d.agent_id))]
      const userIds = [...new Set(data.map(d => d.user_id))]

      // Fetch agents with their profiles
      const { data: agentsData } = await supabase
        .from('agents')
        .select('id, profiles:profile_id(full_name)')
        .in('id', agentIds)

      // Fetch member profiles
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      const agentMap = {}
      ;(agentsData || []).forEach(a => {
        agentMap[a.id] = a.profiles?.full_name || 'Unknown Agent'
      })

      const memberMap = {}
      ;(memberProfiles || []).forEach(p => {
        memberMap[p.id] = p.full_name || 'Unknown Member'
      })

      return data.map(ac => ({
        id: ac.id,
        agent_id: ac.agent_id,
        user_id: ac.user_id,
        chit_id: ac.chit_id,
        commission_amount: ac.commission_amount,
        commission_type: ac.commission_type,
        created_at: ac.created_at,
        agent_name: agentMap[ac.agent_id] || 'Unknown Agent',
        member_name: memberMap[ac.user_id] || 'Unknown Member',
        chit_name: ac.chits?.name || '—'
      }))
    } catch (e) {
      console.error('❌ Critical Commission Log Fetch Failure:', e)
      throw e
    }
  },

  /**
   * Update agent status (approve → active, suspend, reactivate)
   */
  async updateAgentStatus(agentId, newStatus) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('agents')
        .update({
          status: newStatus,
          approved_by: user?.id || null,
          approved_at: new Date().toISOString()
        })
        .eq('id', agentId)
        .select(`
          id,
          profile_id,
          status,
          kyc_verified,
          approved_by,
          approved_at,
          created_at
        `)
        .single()

      if (error) throw error
      return data
    } catch (e) {
      console.error('❌ Agent status update failed:', e)
      throw e
    }
  },

  /**
   * Create a new agent record linked to an existing profile
   */
  async createAgent(profileId) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          profile_id: profileId,
          status: 'pending',
          kyc_verified: false
        }])
        .select(`
          id,
          profile_id,
          status,
          kyc_verified,
          created_at,
          profiles:profile_id(id, full_name, mobile_number)
        `)
        .single()

      if (error) {
        if (error.code === '23505') throw new Error('This profile is already registered as an agent')
        throw error
      }
      return data
    } catch (e) {
      console.error('❌ Agent creation failed:', e)
      throw e
    }
  },

  /**
   * Delete an agent (only if they have no referrals)
   */
  async deleteAgent(agentId) {
    try {
      // Check for referrals first
      const { data: refs, error: refError } = await supabase
        .from('agent_referrals')
        .select('id')
        .eq('agent_id', agentId)
        .limit(1)

      if (refError) throw refError

      if (refs && refs.length > 0) {
        throw new Error('Cannot delete agent with existing referrals. Suspend instead.')
      }

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)

      if (error) throw error
    } catch (e) {
      console.error('❌ Agent deletion failed:', e)
      throw e
    }
  }
}
