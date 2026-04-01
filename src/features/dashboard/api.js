import { supabase } from '../../core/supabase/client'

// --- READS --- //

export const getDashboardStats = async () => {
  // 1. Total Members
  const membersPromise = supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Active Chits
  const chitsPromise = supabase
    .from('chits')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 3. Total Collection (Debits)
  // We'll fetch all debit amounts and sum them in JS, or if it's too large, it might need an RPC later
  // For now, doing JS sum as per standard pattern if no RPC is defined.
  const collectionPromise = supabase
    .from('ledger')
    .select('amount')
    .eq('transaction_type', 'debit')

  // 4. Pending Payouts
  const payoutsPromise = supabase
    .from('maturity_payouts')
    .select('*', { count: 'exact', head: true })
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

  const totalCollection = collectionRes.data.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  return {
    totalMembers: membersRes.count || 0,
    activeChits: chitsRes.count || 0,
    totalCollection: totalCollection,
    pendingPayouts: payoutsRes.count || 0
  }
}

export const getRecentLedger = async () => {
  const { data, error } = await supabase
    .from('ledger')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) throw error
  return data || []
}

// Full ledger for export
export const getFullLedger = async () => {
  const { data, error } = await supabase
    .from('ledger')
    .select('*')
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
