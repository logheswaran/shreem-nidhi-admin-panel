import { supabase } from '../../core/lib/supabase'

export const financeService = {
  // READS
  async getContributions(chitId, month) {
    let query = supabase
      .from('contributions')
      .select('*, chit_members(*, profiles(*))')
    
    if (chitId) query = query.eq('chit_id', chitId)
    if (month) query = query.eq('month_number', month)
    
    const { data, error } = await query.order('month_number', { ascending: false })
    if (error) {
      console.error('❌ Error fetching contributions:', error)
      throw error
    }
    return data || []
  },

  async getLoans() {
    console.log('📡 Fetching active loans...')
    const { data, error } = await supabase
      .from('loans')
      .select('*, chit_members(*, profiles(*)), chits(*)')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error fetching loans:', error)
      throw error
    }
    console.log(`📡 LOANS FETCHED: ${data?.length || 0} rows`)
    return data || []
  },

  async getLedger() {
    console.log('📡 Fetching all ledger records...')
    try {
      const { data, error } = await supabase
        .from('ledger')
        .select('*, profiles(*), chits(*)')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching ledger:', error)
        throw error
      }
      
      console.log(`📡 LEDGER FETCHED: ${data?.length || 0} rows`)
      return data || []
    } catch (e) {
      console.error('❌ Ledger fetch failed:', e)
      throw e
    }
  },

  async getMaturityPayouts() {
    const { data, error } = await supabase
      .from('maturity_payouts')
      .select('*, chit_members(*, profiles(*)), chits(*)')
    if (error) {
      console.error('❌ Error fetching payouts:', error)
      throw error
    }
    return data || []
  },

  async getWinners() {
    const { data, error } = await supabase
      .from('winners')
      .select('*, chit_members(*, profiles(*)), chits(*)')
    if (error) {
      console.error('❌ Error fetching winners:', error)
      throw error
    }
    return data || []
  },

  async getCollectionSummaries() {
    const currentMonthDate = new Date()
    const firstDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    try {
      console.log('📡 Fetching collection summaries...')
      const { data: monthData, error: monthError } = await supabase
        .from('contributions')
        .select('amount_due, amount_paid, payment_status, due_date')
      
      if (monthError) throw monthError
      console.log(`📡 CONTRIBUTIONS (Summary Scope): ${monthData?.length || 0} rows found`)

      const summary = {
        totalDueThisMonth: 0,
        totalCollectedThisMonth: 0,
        totalPending: 0,
        totalOverdue: 0
      }

      // We process all data for global context, but you can add month filtering here if needed
      monthData.forEach(c => {
        summary.totalDueThisMonth += Number(c.amount_due)
        if (c.payment_status === 'paid') {
          summary.totalCollectedThisMonth += Number(c.amount_paid)
        }
        
        if (c.payment_status === 'pending') {
          summary.totalPending += Number(c.amount_due)
          if (c.due_date < today) {
            summary.totalOverdue += Number(c.amount_due)
          }
        }
      })

      return summary
    } catch (e) {
      console.error('Error fetching collection summaries:', e)
      return { totalDueThisMonth: 0, totalCollectedThisMonth: 0, totalPending: 0, totalOverdue: 0 }
    }
  },

  async getChitCollectionProgress() {
    try {
      console.log('📡 Fetching chit collection progress...')
      const { data: chits, error: chitError } = await supabase.from('chits').select('*')
      if (chitError) throw chitError
      console.log(`📡 CHITS FETCHED: ${chits?.length || 0} rows`)

      const { data: contributions, error: contError } = await supabase
        .from('contributions')
        .select('chit_id, amount_due, amount_paid, payment_status, due_date, month_number')
      
      if (contError) throw contError
      console.log(`📡 CONTRIBUTIONS FETCHED: ${contributions?.length || 0} rows`)

      const today = new Date().toISOString().split('T')[0]

      return chits.map(chit => {
        const chitConts = contributions.filter(c => c.chit_id === chit.id)
        
        const totalDue = chitConts.reduce((sum, c) => sum + Number(c.amount_due), 0)
        const totalPaid = chitConts.reduce((sum, c) => sum + (c.payment_status === 'paid' ? Number(c.amount_paid) : 0), 0)
        
        // Calculate member counts for specific statuses
        const membersPaid = chitConts.filter(c => c.payment_status === 'paid').length
        const membersPending = chitConts.filter(c => c.payment_status === 'pending').length
        const membersOverdue = chitConts.filter(c => c.payment_status === 'pending' && c.due_date < today).length
        
        return {
          ...chit,
          totalDue,
          totalPaid,
          membersPaid,
          membersPending,
          membersOverdue,
          totalMembers: chit.total_members || chit.max_members || 0,
          percentage: totalDue > 0 ? (totalPaid / totalDue) * 100 : 100
        }
      })
    } catch (e) {
      console.error('Error fetching chit collection progress:', e)
      return []
    }
  },

  // WRITES (STRICT USAGE OF RPC)
  async createMonthContributions(chitId) {
    const { error } = await supabase.rpc('create_month_contributions', { p_chit_id: chitId })
    if (error) throw error
  },

  async recordContribution(memberId, month, amount, paymentMode = 'Cash', paymentRef = '') {
    // 1. Get contribution ID before recording so we can link it
    const { data: contData } = await supabase
      .from('contributions')
      .select('id')
      .eq('member_id', memberId)
      .eq('month_number', month)
      .single()

    // 2. Call RPC to process payment
    const { error } = await supabase.rpc('record_contribution', { 
      p_member_id: memberId, 
      p_month_number: month, 
      p_amount: amount 
    })
    if (error) throw error

    // 3. Log payment mode to audit_logs (Option A)
    if (contData) {
      const actionPayload = { type: 'payment_recorded', mode: paymentMode, ref: paymentRef }
      await supabase.from('audit_logs').insert([{
        table_name: 'contributions',
        record_id: contData.id,
        action: JSON.stringify(actionPayload)
      }])
    }
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
  async createLedgerEntry(payload, metadata = null) {
    console.log('📡 Attempting Ledger Insertion:', payload)
    const { data, error } = await supabase
      .from('ledger')
      .insert([payload])
      .select('*, profiles(*), chits(*)')
      .single()
    
    if (error) {
       console.error('❌ Insertion Failed:', error)
       throw error
    }

    console.log('✅ Insertion Successful:', data)

    // Log payment metadata to audit logs if provided
    if (metadata && data) {
      await supabase.from('audit_logs').insert([{
        table_name: 'ledger',
        record_id: data.id,
        action: JSON.stringify({ type: 'manual_entry', ...metadata })
      }])
    }

    return data
  },

  async updateLedgerEntry(id, updates) {
    console.log(`📡 Updating Ledger Entry ${id}:`, updates)
    const { data, error } = await supabase
      .from('ledger')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(*), chits(*)')
      .single()

    if (error) {
      console.error('❌ Update Failed:', error)
      throw error
    }
    return data
  },

  async deleteLedgerEntry(id) {
    console.log(`📡 Expunging Ledger Entry ${id}`)
    const { error } = await supabase
      .from('ledger')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Deletion Failed:', error)
      throw error
    }
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
