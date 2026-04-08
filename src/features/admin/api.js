import { supabase } from '../../core/lib/supabase'

export const adminService = {
  // ─── SYSTEM SETTINGS ────────────────────────────────────
  async getSystemSettings() {
    const defaults = {
      penaltyRate: 2.5,
      interestRate: 15.0,
      auctionBuffer: 5,
      autoAlerts: true
    }

    const { data, error } = await supabase
      .from('system_config')
      .select('config_key, config_value')

    if (error) throw error

    const settings = { ...defaults }

    for (const row of data || []) {
      if (row.config_key in settings) {
        const rawValue = row.config_value
        settings[row.config_key] = typeof defaults[row.config_key] === 'boolean'
          ? rawValue === true || rawValue === 'true'
          : Number(rawValue)
      }
    }

    return settings
  },

  async saveSystemSettings(settings) {
    const rows = Object.entries(settings).map(([configKey, configValue]) => ({
      config_key: configKey,
      config_value: configValue
    }))

    const { data, error } = await supabase
      .from('system_config')
      .upsert(rows, { onConflict: 'config_key' })
      .select()

    if (error) throw error
    return data || []
  },

  // ─── ROLE MANAGEMENT ────────────────────────────────────
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Get members only (excludes admins).
   * Use this for the Overrides tab instead of getProfiles().
   * FIX: Bug #3 — getProfiles() was returning admins in the overrides member list.
   */
  async getMembers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role_type', 'member')
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

  // ─── AUDIT LOGS ─────────────────────────────────────────
  /**
   * Paginated audit logs.
   * @param {Object} options
   * @param {number} options.page - Zero-indexed page number
   * @param {number} options.pageSize - Records per page
   */
  async getAuditLogs({ page = 0, pageSize = 50 } = {}) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)
    if (error) throw error
    return data || []
  },

  // ─── KYC QUEUE ──────────────────────────────────────────
  async getPendingKYC() {
    const { data, error } = await supabase
      .from('kyc_details')
      .select('*, profiles(full_name, mobile_number)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Verify a KYC record.
   * FIX: Bug #5 — removed unused `userId` param that was never used in the query.
   */
  async verifyKYC(kycId) {
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

  // ─── OVERRIDES ──────────────────────────────────────────

  /**
   * Get contribution-type ledger entries with server-side filtering.
   * FIX: Bug #4 — previously fetched the ENTIRE ledger and filtered client-side.
   * Now filters server-side with a limit to prevent scaling issues.
   */
  async getContributionLedger() {
    const { data, error } = await supabase
      .from('ledger')
      .select('*, profiles(full_name)')
      .eq('reference_type', 'contribution')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return data || []
  },

  /**
   * Cancel an auction round using the existing RPC.
   * FIX: Bug #6 — `deleteAuctionRound` was setting status to 'closed' via direct update
   * instead of using the `admin_cancel_auction` RPC which properly handles the cascade.
   */
  async cancelAuctionRound(id) {
    const { error } = await supabase.rpc('admin_cancel_auction', { p_auction_id: id })
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
