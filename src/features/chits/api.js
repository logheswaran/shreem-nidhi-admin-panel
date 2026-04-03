import { supabase } from '../../core/lib/supabase'

// --- READS --- //

export const getChits = async () => {
  const { data, error } = await supabase
    .from('chits')
    .select(`
      *,
      chit_members:chit_members(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Flatten the count for easier UI consumption
  return (data || []).map(chit => ({
    ...chit,
    members_count: chit.chit_members?.[0]?.count || 0
  }))
}

export const getChitById = async (id) => {
  const { data, error } = await supabase
    .from('chits')
    .select(`*, chit_members (*, profiles (*))`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getActiveAuctionRound = async (chitId) => {
  const { data, error } = await supabase
    .from('auction_rounds')
    .select('id')
    .eq('chit_id', chitId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  return data?.id
}

// --- BASIC WRITES (Avoid for financial operations when possible) --- //

export const createChit = async (chitData) => {
  const { data, error } = await supabase
    .from('chits')
    .insert([chitData])
    .select()
  if (error) throw error
  return data[0]
}

export const updateChit = async (id, updateData) => {
  const { data, error } = await supabase
    .from('chits')
    .update(updateData)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// --- STRICT RPC CONTROLLERS --- //

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
  const { error } = await supabase.rpc('open_auction', {
    p_chit_id: chitId,
    p_month_number: month
  })
  if (error) throw error
}

export const closeAuction = async (auctionRoundId) => {
  const { error } = await supabase.rpc('close_auction', {
    p_auction_round_id: auctionRoundId
  })
  if (error) throw error
}

export const processMaturity = async (chitId) => {
  const { error } = await supabase.rpc('process_maturity', {
    p_chit_id: chitId
  })
  if (error) throw error
}

// Legacy compat object for any other pages not yet migrated to React Query
export const chitService = {
  getChits,
  getChitById,
  createChit,
  updateChit,
  startMonth,
  selectWinner,
  processMaturity
}
