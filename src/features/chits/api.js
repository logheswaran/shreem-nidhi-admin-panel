import { supabase } from '../../core/lib/supabase'

// --- READS --- //

export const getChitFinancials = async (chitId) => {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .select('amount_due, amount_paid, payment_status, due_date')
      .eq('chit_id', chitId)

    if (error) throw error

    const today = new Date().toISOString().split('T')[0]
    const summary = (data || []).reduce((acc, curr) => {
      if (curr.payment_status === 'paid') {
        acc.collected += Number(curr.amount_paid || 0)
      } else {
        acc.pending += Number(curr.amount_due || 0)
        if (curr.due_date < today) acc.defaults += 1
      }
      return acc
    }, { collected: 0, pending: 0, defaults: 0 })

    return summary
  } catch (err) {
    console.error(`❌ Error computing financials for chit ${chitId}:`, err)
    return { collected: 0, pending: 0, defaults: 0 }
  }
}

/**
 * Normalizes database field names to frontend property names.
 * Ensures compatibility between Supabase schema and Heritage components.
 */
const mapChit = (chit) => {
  if (!chit) return null
  return {
    ...chit,
    max_members: chit.total_members || chit.max_members || chit.members_limit,
    monthly_contribution: chit.monthly_amount || chit.monthly_contribution,
    total_months: chit.duration_months || chit.total_months,
    members_count: chit.members_count || chit.chit_members?.[0]?.count || 0
  }
}

export const getChits = async () => {
  try {
    const { data, error } = await supabase
      .from('chits')
      .select(`
        *,
        chit_members:chit_members(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      throw error
    }

    return (data || []).map(mapChit)
  } catch (error) {
    console.error('Supabase Critical Failure:', error)
    throw error
  }
}
export const getChitById = async (id) => {
  const { data, error } = await supabase
    .from('chits')
    .select(`*, chit_members (*, profiles (*))`)
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  return mapChit(data)
}

export const getChitFullDetails = async (id) => {
  const [chit, financials] = await Promise.all([
    getChitById(id),
    getChitFinancials(id)
  ])

  return {
    ...chit,
    ...financials
  }
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
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data?.id
}

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

export const chitService = {
  getChits,
  getChitById,
  getChitFullDetails,
  getChitFinancials,
  createChit,
  updateChit,
  startMonth,
  selectWinner,
  openAuction,
  closeAuction,
  processMaturity
}
