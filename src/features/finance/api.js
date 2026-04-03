import { supabase } from '../../core/lib/supabase'

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
    return data || []
  },

  async getLedger() {
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_demo') === 'true'
    const isPro = typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_pro_mode') === 'true'

    console.log('📡 Fetching all ledger records...')
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
      console.error('❌ Error fetching ledger:', e)
      if (isPro) return []
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

  async getCollectionSummaries() {
    const currentMonthDate = new Date()
    const firstDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    try {
      // Current Month Due & Paid
      const { data: monthData, error: monthError } = await supabase
        .from('contributions')
        .select('amount_due, amount_paid, payment_status, due_date')
      
      if (monthError) throw monthError

      const summary = {
        totalDueThisMonth: 0,
        totalCollectedThisMonth: 0,
        totalPending: 0,
        totalOverdue: 0
      }

      monthData.forEach(c => {
        if (c.due_date >= firstDay && c.due_date <= lastDay) {
          summary.totalDueThisMonth += Number(c.amount_due)
          if (c.payment_status === 'paid') {
            summary.totalCollectedThisMonth += Number(c.amount_paid)
          }
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
      const { data: chits, error: chitError } = await supabase.from('chits').select('*')
      if (chitError) throw chitError

      const { data: contributions, error: contError } = await supabase
        .from('contributions')
        .select('chit_id, amount_due, amount_paid, payment_status')
      
      if (contError) throw contError

      return chits.map(chit => {
        const chitConts = contributions.filter(c => c.chit_id === chit.id)
        const totalDue = chitConts.reduce((sum, c) => sum + Number(c.amount_due), 0)
        const totalPaid = chitConts.reduce((sum, c) => sum + (c.payment_status === 'paid' ? Number(c.amount_paid) : 0), 0)
        
        return {
          ...chit,
          totalDue,
          totalPaid,
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
    const { data, error } = await supabase
      .from('ledger')
      .insert([payload])
      .select('*, profiles(*), chits(*)')
      .single()
    
    if (error) throw error

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

  async getDefaulters() {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          chit_members (
            id,
            user_id,
            chit_id,
            profiles (full_name, mobile_number),
            chits (name)
          )
        `)
        .eq('payment_status', 'pending')
        .lt('due_date', today)

      if (error) throw error

      // Group by member
      const memberMap = {}
      data.forEach(c => {
        const mid = c.member_id
        if (!memberMap[mid]) {
          memberMap[mid] = {
            member_id: mid,
            full_name: c.chit_members?.profiles?.full_name,
            mobile_number: c.chit_members?.profiles?.mobile_number,
            chit_name: c.chit_members?.chits?.name,
            overdue_count: 0,
            total_overdue_amount: 0,
            installments: []
          }
        }
        memberMap[mid].overdue_count += 1
        memberMap[mid].total_overdue_amount += Number(c.amount_due)
        memberMap[mid].installments.push(c)
      })

      return Object.values(memberMap).sort((a, b) => b.overdue_count - a.overdue_count)
    } catch (e) {
      console.error('Error fetching defaulters:', e)
      return []
    }
  },

  async getDailyCollectionReport(date) {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('contributions')
      .select('*, chit_members(profiles(full_name)), chits(name)')
      .eq('payment_status', 'paid')
      .gte('paid_at', targetDate + 'T00:00:00')
      .lte('paid_at', targetDate + 'T23:59:59')
    if (error) throw error
    return data || []
  },

  async getMonthlyProfitReport() {
    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .eq('reference_type', 'commission')
    if (error) throw error
    
    // Group by month
    const profitMap = {}
    data.forEach(item => {
      const month = item.created_at.slice(0, 7) // YYYY-MM
      profitMap[month] = (profitMap[month] || 0) + Number(item.amount)
    })
    
    return Object.entries(profitMap).map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month))
  }
}
