import { supabase } from '../../core/supabase/client'

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
    try {
      const { data, error } = await supabase
        .from('ledger')
        .select('*, profiles(*), chits(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) {
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
  }
}
