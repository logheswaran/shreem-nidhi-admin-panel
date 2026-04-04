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

const MOCK_APPLICATIONS = [
  {
    id: "APP-001",
    user_id: "u101",
    chit_id: "c1",
    status: "pending",
    kyc_status: "verified",
    applied_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    monthly_income: 45000,
    profiles: { 
      full_name: "Karthik Raja", 
      mobile_number: "+91 98401 23456", 
      email: "karthik@example.com",
      address: "No. 12, Gandhi St, Chennai"
    },
    chits: { 
      name: "ShreemNidhi Special 250", 
      monthly_amount: 5000,
      total_value: 250000
    },
    risk: { level: "LOW", reason: "Income significantly higher than monthly commitment." },
    documents: [
      { type: "ID Proof", name: "Aadhaar Card", status: "verified", url: "https://example.com/id.jpg" },
      { type: "Address Proof", name: "Utility Bill", status: "verified", url: "https://example.com/addr.jpg" }
    ],
    audit_log: [
      { action: "Submission", user: "Karthik Raja", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }
    ]
  },
  {
    id: "APP-002",
    user_id: "u102",
    chit_id: "c2",
    status: "pending",
    kyc_status: "pending",
    applied_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    monthly_income: 18000,
    profiles: { 
      full_name: "Meena Kumari", 
      mobile_number: "+91 98401 55667", 
      email: "meena@example.com",
      address: "Flat 4B, Heritage Apts, Madurai"
    },
    chits: { 
      name: "Svarnam", 
      monthly_amount: 10000,
      total_value: 500000
    },
    risk: { level: "HIGH", reason: "Monthly commitment exceeds 50% of declared income." },
    documents: [
      { type: "ID Proof", name: "PAN Card", status: "pending", url: "https://example.com/pan.jpg" },
      { type: "Address Proof", name: "Voter ID", status: "pending", url: "https://example.com/voter.jpg" }
    ],
    audit_log: [
      { action: "Submission", user: "Meena Kumari", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() }
    ]
  },
  {
    id: "APP-003",
    user_id: "u103",
    chit_id: "c1",
    status: "approved",
    kyc_status: "verified",
    applied_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    reviewed_by_name: "Admin Loghes",
    monthly_income: 60000,
    profiles: { full_name: "Suresh Prabhu", mobile_number: "+91 90031 99887" },
    chits: { name: "ShreemNidhi Special 250", monthly_amount: 5000 },
    risk: { level: "LOW", reason: "Excellent financial buffer." }
  },
  {
    id: "APP-004",
    user_id: "u104",
    chit_id: "c2",
    status: "rejected",
    kyc_status: "failed",
    rejection_reason: "KYC documents were blurry and unverifiable after 2 attempts.",
    applied_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    reviewed_by_name: "Admin Loghes",
    monthly_income: 30000,
    profiles: { full_name: "Anita Bose", mobile_number: "+91 97788 11223" },
    chits: { name: "Svarnam", monthly_amount: 10000 },
    risk: { level: "MEDIUM", reason: "Income borderline for commitment." }
  },
  {
    id: "APP-005",
    user_id: "u105",
    chit_id: "c1",
    status: "pending",
    kyc_status: "verified",
    applied_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    monthly_income: 55000,
    profiles: { full_name: "Vimal Kumar", mobile_number: "+91 91234 56789" },
    chits: { name: "ShreemNidhi Special 250", monthly_amount: 5000 },
    risk: { level: "LOW", reason: "Stable income, low commitment." }
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
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_demo') === 'true'
    try {
      const { data, error } = await supabase
        .from('member_applications')
        .select('*, profiles(*), chits(*)')
        .order('applied_at', { ascending: false })
      if (error) throw error

      if ((!data || data.length === 0) && isDemo) {
        return MOCK_APPLICATIONS
      }
      return data || []
    } catch (e) {
      if (isDemo) return MOCK_APPLICATIONS
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
