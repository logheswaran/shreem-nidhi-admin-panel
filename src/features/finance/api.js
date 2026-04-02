import { supabase } from '../../core/supabase/client'

const MOCK_LEDGER = [
  {
    id: 'l-mock-1',
    user_id: 'u1',
    transaction_type: 'credit',
    reference_type: 'contribution',
    amount: 4000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    profiles: { full_name: 'Rajesh Sharma' },
    chits: { name: 'ShreemNidhi Special 250' }
  },
  {
    id: 'l-mock-2',
    user_id: 'u2',
    transaction_type: 'credit',
    reference_type: 'contribution',
    amount: 8000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    profiles: { full_name: 'Priya Iyer' },
    chits: { name: 'Svarnam' }
  },
  {
    id: 'l-mock-3',
    user_id: 'u3',
    transaction_type: 'credit',
    reference_type: 'contribution',
    amount: 4000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    profiles: { full_name: 'Amit Varma' },
    chits: { name: 'ShreemNidhi Special 250' }
  },
  {
    id: 'l-mock-4',
    user_id: 'u4',
    transaction_type: 'credit',
    reference_type: 'contribution',
    amount: 8000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    profiles: { full_name: 'Sneha Reddy' },
    chits: { name: 'Svarnam' }
  },
  {
    id: 'l-mock-5',
    user_id: 'u5',
    transaction_type: 'credit',
    reference_type: 'contribution',
    amount: 4000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    profiles: { full_name: 'Vikram Singh' },
    chits: { name: 'ShreemNidhi Special 250' }
  },
  {
    id: 'l-mock-6',
    user_id: 'u6',
    transaction_type: 'credit',
    reference_type: 'contribution',
    amount: 1000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    profiles: { full_name: 'Admin Member' },
    chits: { name: 'ShreemNidhi Special 250' }
  }
]

export const financeService = {
  // READS
  async getContributions(chitId, month) {
    try {
      let query = supabase
        .from('contributions')
        .select('*, chit_members(*, profiles(*))')
      
      if (chitId) query = query.eq('chit_id', chitId)
      if (month) query = query.eq('month_number', month)
      
      const { data, error } = await query.order('month_number', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  async getLoans() {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*, chit_members(*, profiles(*)), chits(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  async getLedger() {
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_demo') === 'true'
    const isPro = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_pro_mode') === 'true'

    try {
      const { data, error } = await supabase
        .from('ledger')
        .select('*, profiles(*), chits(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      
      // PRO MODE: Show exact DB state
      if (isPro) return data || []

      if ((!data || data.length === 0) && isDemo) {
        return MOCK_LEDGER
      }
      
      return data || []
    } catch (e) {
      if (isPro) {
        console.error('PRO_MODE SUPABASE ERROR:', e)
        return []
      }
      if (isDemo) return MOCK_LEDGER
      return []
    }
  },

  async getMaturityPayouts() {
    try {
      const { data, error } = await supabase
        .from('maturity_payouts')
        .select('*, chit_members(*, profiles(*)), chits(*)')
      if (error) throw error
      return data || []
    } catch { return [] }
  },

  async getWinners() {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*, chit_members(*, profiles(*)), chits(*)')
      if (error) throw error
      return data || []
    } catch { return [] }
  },

  // WRITES (STRICT USAGE OF RPC)
  async createMonthContributions(chitId) {
    const { error } = await supabase.rpc('create_month_contributions', { p_chit_id: chitId })
    if (error) throw error
  },

  async recordContribution(memberId, month, amount) {
    const { error } = await supabase.rpc('record_contribution', { 
      p_member_id: memberId, 
      p_month_number: month, 
      p_amount: amount 
    })
    if (error) throw error
  },

  async selectWinner(chitId) {
    const { error } = await supabase.rpc('select_winner', { p_chit_id: chitId })
    if (error) throw error
  },

  async issueLoan(memberId, amount) {
    const { error } = await supabase.rpc('issue_loan', { 
      p_member_id: memberId, 
      p_amount: amount 
    })
    if (error) throw error
  },

  async repayLoan(loanId, amount) {
    const { error } = await supabase.rpc('repay_loan', { 
      p_loan_id: loanId, 
      p_amount: amount 
    })
    if (error) throw error
  },

  async processMaturity(chitId) {
    const { error } = await supabase.rpc('process_maturity', { p_chit_id: chitId })
    if (error) throw error
  },

  // LEDGER DIRECT CRUD
  async createLedgerEntry(payload) {
    const { data, error } = await supabase
      .from('ledger')
      .insert([payload])
      .select('*, profiles(*), chits(*)')
      .single()
    if (error) throw error
    return data
  },

  async updateLedgerEntry(id, updates) {
    const { data, error } = await supabase
      .from('ledger')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(*), chits(*)')
      .single()
    if (error) throw error
    return data
  },

  async deleteLedgerEntry(id) {
    const { error } = await supabase
      .from('ledger')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getLedgerByDateRange(from, to) {
    const { data, error } = await supabase
      .from('ledger')
      .select('*, profiles(*), chits(*)')
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }
}
