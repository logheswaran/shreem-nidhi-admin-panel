import { supabase } from '../../core/lib/supabase'

const MOCK_MEMBERS = [
  {
    id: 'mock-1',
    user_id: 'u1',
    chit_id: 'C001',
    status: 'active',
    total_contribution: 4000,
    months_paid: 4,
    profiles: { full_name: 'Rajesh Sharma', mobile_number: '+919876543210', email: 'rajesh@sreemnidhi.com' },
    chits: { name: 'SreeNidhi 250 (Pioneer)', monthly_amount: 25000 },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-2',
    user_id: 'u2',
    chit_id: 'C002',
    status: 'active',
    total_contribution: 8000,
    months_paid: 4,
    profiles: { full_name: 'Priya Iyer', mobile_number: '+919876543211', email: 'priya@sreemnidhi.com' },
    chits: { name: 'Golden Harvest (Auction)', monthly_amount: 10000 },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-3',
    user_id: 'u3',
    chit_id: 'C001',
    status: 'active',
    total_contribution: 4000,
    months_paid: 4,
    profiles: { full_name: 'Amit Varma', mobile_number: '+919876543212', email: 'amit@sreemnidhi.com' },
    chits: { name: 'SreeNidhi 250 (Pioneer)', monthly_amount: 25000 },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-4',
    user_id: 'u4',
    chit_id: 'C002',
    status: 'active',
    total_contribution: 8000,
    months_paid: 4,
    profiles: { full_name: 'Sneha Reddy', mobile_number: '+919876543213', email: 'sneha@sreemnidhi.com' },
    chits: { name: 'Golden Harvest (Auction)', monthly_amount: 10000 },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-5',
    user_id: 'u5',
    chit_id: 'C001',
    status: 'active',
    total_contribution: 4000,
    months_paid: 4,
    profiles: { full_name: 'Vikram Singh', mobile_number: '+919876543214', email: 'vikram@sreemnidhi.com' },
    chits: { name: 'SreeNidhi 250 (Pioneer)', monthly_amount: 25000 },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4).toISOString()
  },
  {
    id: 'mock-6',
    user_id: 'u6',
    chit_id: 'C003',
    status: 'active',
    total_contribution: 1000,
    months_paid: 1,
    profiles: { full_name: 'Admin Member', mobile_number: '+919025169190', email: 'admin@sreemnidhi.com' },
    chits: { name: 'Shreem Nidhi Special (Random)', monthly_amount: 50000 },
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  }
]

const MOCK_APPLICATIONS = [
  {
    id: "APP-001",
    user_id: "u101",
    chit_id: "C001",
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
      name: "SreeNidhi 250 (Pioneer)", 
      monthly_amount: 25000,
      total_value: 5000000
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
    chit_id: "C002",
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
      name: "Golden Harvest (Auction)", 
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
  }
]

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
      const { data, error } = await supabase
        .from('member_applications')
        .select('*, profiles:user_id(*), chits:chit_id(*)')
        .order('applied_at', { ascending: false })
      
      if (error) {
        console.error('📡 SUPABASE ERROR (getApplications):', error)
        throw error
      }

      console.log('✅ SUPABASE DATA (Applications):', data)
      return data || []
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
    const { data, error } = await supabase
      .from('chit_members')
      .update(updates)
      .eq('id', id)
      .select('*, profiles:user_id(*), chits:chit_id(*)')
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
      .select('*, profiles:user_id(*), chits:chit_id(*)')
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
