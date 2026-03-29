import { supabase } from '../lib/supabase'

export const chitService = {
  /**
   * Fetch all chits
   */
  async getChits() {
    try {
      const { data, error } = await supabase
        .from('chits')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  /**
   * Fetch a single chit with its members
   */
  async getChitById(id) {
    const { data, error } = await supabase
      .from('chits')
      .select(`
        *,
        chit_members (
          *,
          profiles (*)
        )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  /**
   * Create a new chit (Admin only, non-financial)
   */
  async createChit(chitData) {
    const { data, error } = await supabase
      .from('chits')
      .insert([chitData])
      .select()
    if (error) throw error
    return data[0]
  },

  /**
   * Update chit status or basic info
   */
  async updateChit(id, updateData) {
    const { data, error } = await supabase
      .from('chits')
      .update(updateData)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}
