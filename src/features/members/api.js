import { supabase } from '../../core/supabase/client'

export const memberService = {
  /**
   * Fetch all members
   */
  async getMembers() {
    try {
      const { data, error } = await supabase
        .from('chit_members')
        .select('*, profiles(*), chits(*)')
      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('Supabase Offline: Returning mock members');
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
