import { useState, useEffect, useCallback } from 'react'
import { memberService } from './api'
import toast from 'react-hot-toast'

/**
 * Hook for managing member state with optimistic updates.
 */
export const useMembers = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await memberService.getMembers()
      setMembers(data)
      setError(null)
    } catch (err) {
      setError(err)
      toast.error('Failed to fetch members directory')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  /**
   * Optimistically add a member
   */
  const addMember = async (payload) => {
    const tempId = 'temp-' + Date.now()
    // Create a mock record for optimistic UI
    const optimistic = { 
      id: tempId, 
      ...payload,
      profiles: { full_name: payload.full_name || 'Loading...', mobile_number: payload.mobile_number },
      chits: { name: 'Assigning...' },
      status: payload.status || 'active',
      joined_at: new Date().toISOString()
    }
    
    setMembers(prev => [optimistic, ...prev])
    
    try {
      const real = await memberService.createMember(payload)
      setMembers(prev => prev.map(m => m.id === tempId ? real : m))
      toast.success('Member enrolled successfully')
      return real
    } catch (err) {
      setMembers(prev => prev.filter(m => m.id !== tempId))
      toast.error('Failed to enroll member')
      throw err
    }
  }

  /**
   * Optimistically update a member
   */
  const editMember = async (id, updates) => {
    const previousMembers = [...members]
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
    
    try {
      const updated = await memberService.updateMember(id, updates)
      setMembers(prev => prev.map(m => m.id === id ? updated : m))
      toast.success('Member records updated')
      return updated
    } catch (err) {
      setMembers(previousMembers)
      toast.error('Failed to update member records')
      throw err
    }
  }

  /**
   * Optimistically remove a member
   */
  const removeMember = async (id) => {
    const previousMembers = [...members]
    setMembers(prev => prev.filter(m => m.id !== id))
    
    try {
      await memberService.deleteMember(id)
      toast.success('Member removed from directory')
    } catch (err) {
      setMembers(previousMembers)
      toast.error('Failed to remove member')
      throw err
    }
  }

  return {
    members,
    loading,
    error,
    addMember,
    editMember,
    removeMember,
    refetch: fetchMembers
  }
}
