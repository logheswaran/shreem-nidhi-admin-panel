import { supabase } from '../lib/supabase'

export const auctionService = {
  // READS
  async getAuctionRounds(chitId) {
    try {
      const { data, error } = await supabase
        .from('auction_rounds')
        .select('*')
        .eq('chit_id', chitId)
        .order('month_number', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  async getBids(roundId) {
    const { data, error } = await supabase
      .from('bids')
      .select('*, chit_members(*, profiles(*))')
      .eq('auction_round_id', roundId)
      .order('bid_amount', { ascending: false })
    if (error) throw error
    return data
  },

  // WRITES (STRICT USAGE OF RPC)
  async openAuction(chitId, month) {
    const { data, error } = await supabase.rpc('open_auction', { 
      p_chit_id: chitId, 
      p_month_number: month 
    })
    if (error) throw error
    return data // returns round ID
  },

  async placeBid(memberId, roundId, amount) {
    const { error } = await supabase.rpc('place_bid', { 
      p_member_id: memberId, 
      p_auction_round_id: roundId, 
      p_amount: amount 
    })
    if (error) throw error
  },

  async closeAuction(roundId) {
    const { error } = await supabase.rpc('close_auction', { 
      p_auction_round_id: roundId 
    })
    if (error) throw error
  }
}
