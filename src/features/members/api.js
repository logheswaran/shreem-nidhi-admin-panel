import { supabase } from '../../core/lib/supabase'


export const memberService = {
  /**
   * Fetch all members
   */
  async getMembers() {
    try {
      const { data, error } = await supabase
        .from('chit_members')
        .select(`
          id,
          chit_id,
          user_id,
          status,
          total_contribution,
          months_paid,
          joined_at,
          profiles:user_id(id, full_name, mobile_number),
          chits:chit_id(id, name, monthly_amount)
        `)

      if (error) {
        console.error('📡 SUPABASE ERROR (getMembers):', error)
        throw error
      }

      console.log('✅ JOINED DATA (Members):', data)
      return data || []
    } catch (e) {
      console.error('❌ Critical Fetch Failure:', e)
      throw e
    }
  },

  /**
   * Aggregate member statistics for dashboard cards
   */
  async getMemberStats() {
    const members = await this.getMembers()
    const activeMembers = members.filter(m => m.status === 'active')
    const defaulters = members.filter(m => m.status === 'defaulter')
    
    // Portfolio value: Sum of all total contributions
    const portfolioValue = members.reduce((sum, m) => sum + (Number(m.total_contribution) || 0), 0)
    
    // Monthly collected: Sum of monthly amounts for active members
    const monthlyCollected = activeMembers.reduce((sum, m) => sum + (Number(m.chits?.monthly_amount) || 0), 0)
    
    return {
      total: members.length,
      active: activeMembers.length,
      defaulters: defaulters.length,
      portfolioValue,
      monthlyCollected
    }
  },

  /**
   * Fetch pending member applications
   */
  async getApplications() {
    try {
      console.log('📡 Fetching applications from Supabase...')
      const { data, error } = await supabase
        .from('member_applications')
        .select(`
          *,
          profiles:user_id(*),
          chits:chit_id(*)
        `)
        .order('applied_at', { ascending: false })
      
      if (error) {
        console.error('📡 SUPABASE ERROR (getApplications):', error)
        throw error
      }

      console.log('✅ SUPABASE DATA (Applications Raw):', data?.length, 'rows found')
      // Map database columns to UI-expected object structure
      return (data || []).map(app => ({
        ...app,
        risk: { 
          level: app.risk_level || 'LOW', 
          reason: app.risk_reason || 'Verified baseline' 
        },
        kyc_status: app.kyc_status || 'verified'
      }))
    } catch (e) {
      console.error('❌ Critical Applications Fetch Failure:', e)
      throw e
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
    try {
      const { full_name, mobile_number, email, status, chit_id } = updates
      
      // 1. Get user_id first
      const { data: memberData } = await supabase
        .from('chit_members')
        .select('user_id')
        .eq('id', id)
        .single()

      if (memberData?.user_id) {
        // 2. Update Profile
        await supabase
          .from('profiles')
          .update({ full_name, mobile_number, email })
          .eq('id', memberData.user_id)
      }

      // 3. Update Membership
      const { data, error } = await supabase
        .from('chit_members')
        .update({ status, chit_id })
        .eq('id', id)
        .select('*, profiles:user_id(*), chits:chit_id(*)')
        .single()
      
      if (error) throw error
      return data
    } catch (e) {
      console.error('❌ Update Failure:', e)
      throw e
    }
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
    try {
      const { full_name, mobile_number, email, chit_id, status } = payload

      // 1. Ensure Profile exists (or create one)
      let { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile_number', mobile_number)
        .maybeSingle()

      if (!profile) {
        const { data: newProfile, error: profileCreateError } = await supabase
          .from('profiles')
          .insert([{ 
            full_name, 
            mobile_number, 
            email,
            role_type: 'member'
          }])
          .select()
          .single()
        
        if (profileCreateError) throw profileCreateError
        profile = newProfile
      }

      // 2. Link to Chit Scheme
      const { data: membership, error: memberError } = await supabase
        .from('chit_members')
        .insert([{
          chit_id,
          user_id: profile.id,
          status: status || 'active'
        }])
        .select('*, profiles:user_id(*), chits:chit_id(*)')
        .single()
      
      if (memberError) {
         if (memberError.code === '23505') throw new Error('Member is already enrolled in this scheme')
         throw memberError
      }

      return membership
    } catch (e) {
      console.error('❌ Enrollment Failure:', e)
      throw e
    }
  },

  /**
   * Get single member with joins for quick view
   */
  async getMemberById(id) {
    const { data, error } = await supabase
      .from('chit_members')
      .select('*, profiles:user_id(*), chits:chit_id(*)')
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
  },

  /**
   * Request more info from applicant
   */
  async requestMoreInfo(applicationId, message) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('member_applications')
      .update({ 
        status: 'info_requested', 
        info_request_message: message,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id
      })
      .eq('id', applicationId)
    if (error) throw error
  }
}
