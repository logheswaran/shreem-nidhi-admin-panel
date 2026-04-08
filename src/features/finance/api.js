import { supabase } from '../../core/lib/supabase'

export const financeService = {
  // READS
  async getContributions(chitId, month, { page = 0, pageSize = 25 } = {}) {
    let query = supabase
      .from('contributions')
      .select('*, chit_members(*, profiles(*))', { count: 'exact' })
    
    if (chitId) query = query.eq('chit_id', chitId)
    if (month) query = query.eq('month_number', month)
    
    const { data, error, count } = await query
      .order('month_number', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)
    
    if (error) {
      console.error('❌ Error fetching contributions:', error)
      throw error
    }
    return { data: data || [], total: count || 0, page, pageSize }
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
    return data || []
  },

  async getLedger({ page = 0, pageSize = 100 } = {}) {
    console.log('📡 Fetching ledger records...')
    try {
      const { data, error } = await supabase
        .from('ledger')
        .select('*, profiles(*), chits(*)')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
      
      if (error) {
        console.error('❌ Error fetching ledger:', error)
        throw error
      }
      
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
    const today = new Date().toISOString().split('T')[0]

    try {
      // Fetch contributions with member names joined
      const { data: contributions, error: contError } = await supabase
        .from('contributions')
        .select(`
          amount_due, 
          amount_paid, 
          payment_status, 
          due_date,
          chit_members:member_id (
            profiles:user_id (full_name)
          )
        `)
      
      if (contError) {
        console.error('📡 SUPABASE ERROR (getCollectionSummaries):', contError)
        throw contError
      }

      // Aggregate using reduce for precision
      const summary = (contributions || []).reduce((acc, c) => {
        const due = Number(c.amount_due || 0)
        const paid = Number(c.amount_paid || 0)

        acc.totalDueThisMonth += due
        
        if (c.payment_status === 'paid') {
          acc.totalCollectedThisMonth += paid
        } else {
          acc.totalPending += due
          if (c.due_date && c.due_date < today) {
            acc.totalOverdue += due
          }
        }
        return acc
      }, {
        totalDueThisMonth: 0,
        totalCollectedThisMonth: 0,
        totalPending: 0,
        totalOverdue: 0
      })

      return summary
    } catch (e) {
      console.error('❌ Finance Summary Aggregation Failure:', e)
      return { totalDueThisMonth: 0, totalCollectedThisMonth: 0, totalPending: 0, totalOverdue: 0 }
    }
  },

  async getChitCollectionProgress() {
    try {
      const { data: chits, error: chitError } = await supabase
        .from('chits')
        .select(`
          *,
          chit_members:chit_members(count)
        `)
      if (chitError) throw chitError

      const { data: contributions, error: contError } = await supabase
        .from('contributions')
        .select('chit_id, amount_due, amount_paid, payment_status, due_date, month_number')
      
      if (contError) throw contError

      return (chits || []).map(chit => {
        const chitConts = contributions.filter(c => c.chit_id === chit.id)
        const totalDue = chitConts.reduce((sum, c) => sum + Number(c.amount_due || 0), 0)
        const totalPaid = chitConts.reduce((sum, c) => sum + (c.payment_status === 'paid' ? Number(c.amount_paid || 0) : 0), 0)
        
        const membersPaid = chitConts.filter(c => c.payment_status === 'paid').length
        const membersPending = chitConts.filter(c => c.payment_status === 'pending').length
        
        // Normalize for UI
        return {
          ...chit,
          name: chit.name || 'Untitled Scheme',
          current_month: chit.current_month || 1,
          total_months: chit.duration_months || chit.total_months || 50,
          totalMembers: chit.total_members || chit.max_members || chit.chit_members?.[0]?.count || 0,
          totalDue,
          totalPaid,
          membersPaid,
          membersPending,
          membersOverdue: chitConts.filter(c => c.payment_status === 'pending' && c.due_date < new Date().toISOString().split('T')[0]).length,
          percentage: totalDue > 0 ? (totalPaid / totalDue) * 100 : 100
        }
      })
    } catch (e) {
      console.error('Error fetching chit collection progress:', e)
      return []
    }
  },

  async getSchemeMembers(chitId) {
    const { data: contributions, error } = await supabase
      .from('contributions')
      .select(`
        *,
        chit_members (
          id,
          user_id,
          profiles (full_name, mobile_number)
        )
      `)
      .eq('chit_id', chitId)
      .order('due_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching scheme members:', error)
      throw error
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Group by member and get latest contribution
    const memberMap = {}
    contributions?.forEach(c => {
      const memberId = c.member_id
      if (!memberMap[memberId] || c.month_number > memberMap[memberId].monthNumber) {
        memberMap[memberId] = {
          id: memberId,
          name: c.chit_members?.profiles?.full_name || 'Unknown',
          phone: c.chit_members?.profiles?.mobile_number || '',
          amountDue: c.amount_due,
          amountPaid: c.amount_paid,
          status: c.payment_status === 'paid' ? 'PAID' : c.due_date < today ? 'OVERDUE' : 'PENDING',
          dueDate: c.due_date,
          paidAt: c.paid_at,
          monthNumber: c.month_number,
          contributionId: c.id
        }
      }
    })
    
    return Object.values(memberMap)
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

  async markContributionFailed(contributionId, reason = '') {
    const { data, error } = await supabase
      .from('contributions')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', contributionId)
      .select()
      .single()
    
    if (error) throw error

    // Audit log for failed contribution
    await supabase.from('audit_logs').insert([{
      table_name: 'contributions',
      record_id: contributionId,
      action: JSON.stringify({ type: 'contribution_failed', reason })
    }])

    return data
  },

  async markContributionWaived(contributionId, reason = '') {
    const { data, error } = await supabase
      .from('contributions')
      .update({ status: 'waived', updated_at: new Date().toISOString() })
      .eq('id', contributionId)
      .select()
      .single()
    
    if (error) throw error

    // Audit log for waived contribution
    await supabase.from('audit_logs').insert([{
      table_name: 'contributions',
      record_id: contributionId,
      action: JSON.stringify({ type: 'contribution_waived', reason })
    }])

    return data
  },

  async updateContribution(id, updates) {
    const { data, error } = await supabase
      .from('contributions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
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

  async closeLoan(loanId, reason = 'manual_closure') {
    // Close loan updates status only if balance is zero or admin override
    const { data: loan, error: fetchError } = await supabase
      .from('loans')
      .select('balance')
      .eq('id', loanId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (Number(loan.balance) > 0) {
      throw new Error('Cannot close loan with outstanding balance. Please repay first or write off.')
    }

    const { data, error } = await supabase
      .from('loans')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', loanId)
      .select()
      .single()
    
    if (error) throw error

    // Audit log for loan closure
    await supabase.from('audit_logs').insert([{
      table_name: 'loans',
      record_id: loanId,
      action: JSON.stringify({ type: 'loan_closed', reason })
    }])

    return data
  },

  async writeOffLoan(loanId, reason = '') {
    // Write off loan with remaining balance (requires audit)
    const { data: loan, error: fetchError } = await supabase
      .from('loans')
      .select('balance, member_id')
      .eq('id', loanId)
      .single()
    
    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('loans')
      .update({ 
        status: 'written_off', 
        written_off_amount: loan.balance,
        balance: 0,
        updated_at: new Date().toISOString() 
      })
      .eq('id', loanId)
      .select()
      .single()
    
    if (error) throw error

    // Audit log for write-off (important for compliance)
    await supabase.from('audit_logs').insert([{
      table_name: 'loans',
      record_id: loanId,
      action: JSON.stringify({ 
        type: 'loan_written_off', 
        reason,
        amount_written_off: loan.balance 
      })
    }])

    return data
  },

  async processMaturity(chitId) {
    const { error } = await supabase.rpc('process_maturity', { p_chit_id: chitId })
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
  },

  async updateLoan(id, updates) {
    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select('*, chit_members(*, profiles(*)), chits(*)')
      .single()
    
    if (error) throw error
    return data
  }
}
