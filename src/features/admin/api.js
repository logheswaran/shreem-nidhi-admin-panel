import { supabase } from '../../core/lib/supabase'

export const adminService = {
  // ROLE MANAGEMENT
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async updateRole(userId, newRole) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role_type: newRole })
      .eq('id', userId)
      .select()
    if (error) throw error
    return data
  },

  // AUDIT LOGS
  async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  // KYC QUEUE
  async getPendingKYC() {
    const { data, error } = await supabase
      .from('kyc_details')
      .select('*, profiles(full_name, mobile_number)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async verifyKYC(kycId, userId) {
    const { data, error } = await supabase
      .from('kyc_details')
      .update({ 
        status: 'verified', 
        aadhaar_verified: true, 
        pan_verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq('id', kycId)
      .select()
    if (error) throw error
    return data
  },

  async rejectKYC(kycId) {
    const { data, error } = await supabase
      .from('kyc_details')
      .update({ status: 'rejected' })
      .eq('id', kycId)
      .select()
    if (error) throw error
    return data
  },

  // OVERRIDES
  async deleteAuctionRound(id) {
    const { error } = await supabase
      .from('auction_rounds')
      .update({ status: 'closed' }) // Cancellation is usually closing without winner
      .eq('id', id)
    if (error) throw error
  },

  async markMaturityPaid(id) {
    const { error } = await supabase
      .from('maturity_payouts')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async reversePayment(ledgerId, reason) {
    const { error } = await supabase.rpc('admin_reverse_payment', { 
      p_ledger_id: ledgerId, 
      p_reason: reason 
    })
    if (error) throw error
  },

  async freezeMember(memberId, freeze) {
    const { error } = await supabase.rpc('admin_freeze_member', { 
      p_member_id: memberId, 
      p_freeze: freeze 
    })
    if (error) throw error
  },

  async cancelAuction(auctionId) {
    const { error } = await supabase.rpc('admin_cancel_auction', { 
       p_auction_id: auctionId 
    })
    if (error) throw error
  }
}
