import { supabase } from '../../core/lib/supabase'

// READS
export const getAuctionRounds = async (chitId, { page = 0, pageSize = 50 } = {}) => {
  try {
    const { data, error } = await supabase
      .from('auction_rounds')
      .select('*')
      .eq('chit_id', chitId)
      .order('month_number', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)
    if (error) {
      console.error('📡 SUPABASE ERROR (getAuctionRounds):', error)
      throw error
    }
    return data || []
  } catch (e) {
    console.error('❌ Auction Fetch Failure:', e)
    throw e
  }
}

export const getBids = async (roundId) => {
  const { data, error } = await supabase
    .from('bids')
    .select('*, chit_members(*, profiles(*))')
    .eq('auction_round_id', roundId)
    .order('bid_amount', { ascending: false })
  if (error) throw error
  return data
}

// WRITES (STRICT USAGE OF RPC)
export const openAuction = async (chitId, month) => {
  const { data, error } = await supabase.rpc('open_auction', { 
    p_chit_id: chitId, 
    p_month_number: month 
  })
  if (error) throw error
  return data // returns round ID
}

export const placeBid = async (memberId, roundId, amount) => {
  const { error } = await supabase.rpc('place_bid', { 
    p_member_id: memberId, 
    p_auction_round_id: roundId, 
    p_amount: amount 
  })
  if (error) throw error
}

export const closeAuction = async (auctionId) => {
  const { error } = await supabase.rpc('close_auction', { 
    p_auction_round_id: auctionId 
  })
  if (error) throw error
}

export const cancelAuction = async (auctionId) => {
  const { error } = await supabase.rpc('admin_cancel_auction', {
    p_auction_id: auctionId
  })
  if (error) throw error
}

// Legacy compat object
export const auctionService = {
  getAuctionRounds,
  getBids,
  openAuction,
  placeBid,
  closeAuction,
  cancelAuction
}
