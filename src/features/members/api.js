import { supabase } from '../../core/lib/supabase'

const MOCK_MEMBERS = [
  {
    id: 'mock-1',
    user_id: 'u1',
    chit_id: 'c1',
    status: 'active',
    total_contribution: 4000,
    months_paid: 4,
    profiles: { full_name: 'Rajesh Sharma', mobile_number: '+919876543210', email: 'rajesh@sreemnidhi.com' },
    chits: { name: 'ShreemNidhi Special 250' },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-2',
    user_id: 'u2',
    chit_id: 'c2',
    status: 'active',
    total_contribution: 8000,
    months_paid: 4,
    profiles: { full_name: 'Priya Iyer', mobile_number: '+919876543211', email: 'priya@sreemnidhi.com' },
    chits: { name: 'Svarnam' },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-3',
    user_id: 'u3',
    chit_id: 'c1',
    status: 'active',
    total_contribution: 4000,
    months_paid: 4,
    profiles: { full_name: 'Amit Varma', mobile_number: '+919876543212', email: 'amit@sreemnidhi.com' },
    chits: { name: 'ShreemNidhi Special 250' },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-4',
    user_id: 'u4',
    chit_id: 'c2',
    status: 'active',
    total_contribution: 8000,
    months_paid: 4,
    profiles: { full_name: 'Sneha Reddy', mobile_number: '+919876543213', email: 'sneha@sreemnidhi.com' },
    chits: { name: 'Svarnam' },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-5',
    user_id: 'u5',
    chit_id: 'c1',
    status: 'active',
    total_contribution: 4000,
    months_paid: 4,
    profiles: { full_name: 'Vikram Singh', mobile_number: '+919876543214', email: 'vikram@sreemnidhi.com' },
    chits: { name: 'ShreemNidhi Special 250' },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-6',
    user_id: 'u6',
    chit_id: 'c1',
    status: 'active',
    total_contribution: 1000,
    months_paid: 1,
    profiles: { full_name: 'Admin Member', mobile_number: '+919025169190', email: 'admin@sreemnidhi.com' },
    chits: { name: 'ShreemNidhi Special 250' },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  }
]

export const memberService = {
  /**
   * Fetch all members
   */
  async getMembers() {
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_demo') === 'true'
    const isPro = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_pro_mode') === 'true'

    try {
      const { data, error } = await supabase
        .from('chit_members')
        .select('*, profiles(*), chits(*)')
      if (error) throw error
      
      // PRO MODE: Disable mocks, show exactly what's in the DB
      if (isPro) return data || []

      if ((!data || data.length === 0) && isDemo) {
        return MOCK_MEMBERS
      }
      
      return data || []
    } catch (e) {
      if (isPro) {
        // In pro mode, we want to see the real error to debug Supabase
        console.error('PRO_MODE SUPABASE ERROR:', e)
        return []
      }
      if (isDemo) return MOCK_MEMBERS
      console.warn('Supabase Error: Returning empty member set');
      return []
    }
  },

  /**
   * Fetch pending member applications
   */
  async getApplications() {
    try {
      const { data, error } = await supabase
        .from('member_applications')
        .select('*, profiles(*), chits(*)')
        .order('applied_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  /**
   * Approve application and create membership
   */
  async approveApplication(applicationId) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Get application details
    const { data: app, error: appError } = await supabase
      .from('member_applications')
      .select('*')
      .eq('id', applicationId)
      .single()
    if (appError) throw appError

    // 2. Insert into chit_members
    const { error: memberError } = await supabase
      .from('chit_members')
      .insert([{
        chit_id: app.chit_id,
        user_id: app.user_id,
        status: 'active'
      }])
    if (memberError) throw memberError

    // 3. Update application status
    const { error: updateError } = await supabase
      .from('member_applications')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', applicationId)
    if (updateError) throw updateError
  },

  /**
   * Reject application
   */
  async rejectApplication(applicationId, reason) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('member_applications')
      .update({ 
        status: 'rejected', 
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', applicationId)
    if (error) throw error
  },

  /**
   * Fetch KYC details
   */
  async getKycDetails() {
    const { data, error } = await supabase
      .from('kyc_details')
      .select('*, profiles(*)')
    if (error) throw error
    return data
  },

  /**
   * Update member details
   */
  async updateMember(id, updates) {
    const { data, error } = await supabase
      .from('chit_members')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(*), chits(*)')
      .single()
    if (error) throw error
    return data
  },

  /**
   * Delete member
   */
  async deleteMember(id) {
    const { error } = await supabase
      .from('chit_members')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  /**
   * Create new member
   */
  async createMember(payload) {
    const { data, error } = await supabase
      .from('chit_members')
      .insert([payload])
      .select('*, profiles(*), chits(*)')
      .single()
    if (error) throw error
    return data
  },

  /**
   * Get single member with joins for quick view
   */
  async getMemberById(id) {
    const { data, error } = await supabase
      .from('chit_members')
      .select('*, profiles(*), chits(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  /**
   * Verify KYC record
   */
  async verifyKyc(kycId) {
    const { error } = await supabase
      .from('kyc_details')
      .update({ 
        status: 'verified',
        aadhaar_verified: true,
        pan_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', kycId)
    if (error) throw error
  }
}
