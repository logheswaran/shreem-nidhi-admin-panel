import { supabase } from '../../core/lib/supabase'

// --- READS --- //

/**
 * 1. Primary Dashboard Stats Grid
 * Returns aggregated counts and totals for the top stats bar.
 */
export const getDashboardStats = async () => {
  // A. Total Members
  const membersPromise = supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role_type', 'member')

  // B. Active Chits
  const chitsPromise = supabase
    .from('chits')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  // C. Total Collection (All-time paid contributions)
  const collectionPromise = supabase
    .from('contributions')
    .select('amount_paid')
    .eq('payment_status', 'paid')

  // D. Pending Payouts
  const payoutsPromise = supabase
    .from('maturity_payouts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const [membersRes, chitsRes, collectionRes, payoutsRes] = await Promise.all([
    membersPromise,
    chitsPromise,
    collectionPromise,
    payoutsPromise
  ])

  if (membersRes.error) throw membersRes.error
  if (chitsRes.error) throw chitsRes.error
  if (collectionRes.error) throw collectionRes.error
  if (payoutsRes.error) throw payoutsRes.error

  const totalCollection = (collectionRes.data || []).reduce((sum, row) => sum + Number(row.amount_paid || 0), 0)

  return {
    totalMembers: membersRes.count || 0,
    activeChits: chitsRes.count || 0,
    totalCollection: totalCollection,
    pendingPayouts: payoutsRes.count || 0
  }
}

/**
 * 2. Monthly Collection Health
 * Returns status of contributions for the current month.
 * Architecture Note: Contributions link to chits via chit_members bridge.
 */
export const getMonthlyCollectionHealth = async () => {
  const currentMonth = new Date().getMonth() + 1
  
  // A. Fetch active chits for name mapping
  const { data: activeChits, error: chitsError } = await supabase
    .from('chits')
    .select('id, name, monthly_amount')
    .eq('status', 'active')

  if (chitsError) throw chitsError

  // B. Fetch all contributions for this month with bridge to chits
  const { data: contributions, error: contribError } = await supabase
    .from('contributions')
    .select(`
      amount_due, 
      amount_paid, 
      payment_status, 
      month_number, 
      member_id,
      due_date,
      chit_members!inner(chit_id)
    `)
    .eq('month_number', currentMonth)

  if (contribError) throw contribError

  const totalExpected = contributions.reduce((sum, c) => sum + Number(c.amount_due || 0), 0)
  const collected = contributions.filter(c => c.payment_status === 'paid').reduce((sum, c) => sum + Number(c.amount_paid || 0), 0)
  
  // Overdue = Pending and past due date
  const today = new Date().toISOString().split('T')[0]
  const usersYetToPay = contributions.filter(c => 
    c.payment_status === 'pending' && c.due_date < today
  ).length

  // Progress per chit
  const chitProgress = (activeChits || []).map(chit => {
    const chitContribs = contributions.filter(c => c.chit_members?.chit_id === chit.id)
    const expected = chitContribs.reduce((sum, c) => sum + Number(c.amount_due || 0), 0)
    const paid = chitContribs.filter(c => c.payment_status === 'paid').reduce((sum, c) => sum + Number(c.amount_paid || 0), 0)
    
    return {
      name: chit.name,
      percentage: expected > 0 ? Math.round((paid / expected) * 100) : 0
    }
  })

  return {
    totalExpected,
    collected,
    outstanding: totalExpected - collected,
    chitProgress,
    usersYetToPay
  }
}

/**
 * 3. Overdue Contributions Alert
 * Architecture Note: Contributions -> chit_members -> profiles
 */
export const getOverdueContributions = async () => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id, 
      amount_due, 
      due_date, 
      member_id,
      chit_members!inner(
        profiles!inner(full_name)
      )
    `)
    .eq('payment_status', 'pending')
    .lt('due_date', today)
  
  if (error) throw error
  
  // Flatten for easier UI consumption
  return (data || []).map(c => ({
    amount_due: c.amount_due,
    due_date: c.due_date,
    full_name: c.chit_members?.profiles?.full_name || 'Protocol Member'
  }))
}

/**
 * 4. Active Loan Health
 * Sum of outstanding balance for all active loans.
 */
export const getActiveLoanHealth = async () => {
  const { data: activeLoans, error } = await supabase
    .from('loans')
    .select('outstanding_balance, created_at')
    .eq('status', 'active')
  
  if (error) throw error

  const totalOutstanding = (activeLoans || []).reduce((sum, l) => sum + Number(l.outstanding_balance || 0), 0)
  
  // Stale check (loans not updated in 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const needingUpdate = (activeLoans || []).filter(l => l.created_at < thirtyDaysAgo).length

  return {
    count: (activeLoans || []).length,
    totalOutstanding,
    needingUpdate
  }
}

/**
 * 5. Pending Applications Badge
 * Count of applications awaiting review.
 */
export const getPendingApplicationsCount = async () => {
  const { count, error } = await supabase
    .from('member_applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  if (error) throw error
  return count || 0
}

/**
 * 6. Global Chit Progress Tracker
 * Track month-on-month duration progress for all active chits.
 */
export const getChitProgress = async () => {
  const { data, error } = await supabase
    .from('chits')
    .select('name, current_month, duration_months')
    .eq('status', 'active')
  
  if (error) throw error
  return data || []
}

/**
 * 7. Recent Ledger Entries
 * Fetches latest 10 transactions.
 */
export const getRecentLedger = async () => {
  const { data, error } = await supabase
    .from('ledger')
    .select(`
      *,
      profiles(full_name),
      chits(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) throw error
  return data || []
}

/**
 * 8. Full Ledger
 * Complete transaction history (used for analytics/exports).
 */
export const getFullLedger = async () => {
  const { data, error } = await supabase
    .from('ledger')
    .select(`
      *,
      profiles(full_name),
      chits(name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// --- WRITES (STRICT RPC) --- //

export const startMonth = async (chitId) => {
  const { error } = await supabase.rpc('create_month_contributions', {
    p_chit_id: chitId
  })
  if (error) throw error
}

export const selectWinner = async (chitId) => {
  const { error } = await supabase.rpc('select_winner', {
    p_chit_id: chitId
  })
  if (error) throw error
}

export const openAuction = async (chitId, month) => {
  const { data, error } = await supabase.rpc('open_auction', {
    p_chit_id: chitId,
    p_month_number: month
  })
  if (error) throw error
  return data
}

export const closeAuction = async (auctionId) => {
  const { error } = await supabase.rpc('close_auction', {
    p_auction_round_id: auctionId
  })
  if (error) throw error
}

export const processMaturity = async (chitId) => {
  const { error } = await supabase.rpc('process_maturity', {
    p_chit_id: chitId
  })
  if (error) throw error
}
