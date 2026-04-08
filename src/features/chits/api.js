import { supabase } from '../../core/lib/supabase'

// --- CONSTANTS & MOCKS --- //

const MOCK_CHITS = [
  {
    id: 'C001',
    name: 'SreeNidhi 250 (Pioneer)',
    chit_type: 'traditional',
    status: 'active',
    monthly_contribution: 25000,
    max_members: 20,
    members_count: 20,
    current_month: 12,
    total_months: 20,
    total_collected: 4500000,
    pending_amount: 50000,
    default_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
  },
  {
    id: 'C002',
    name: 'Golden Harvest (Auction)',
    chit_type: 'traditional',
    status: 'active',
    monthly_contribution: 10000,
    max_members: 50,
    members_count: 50,
    current_month: 45,
    total_months: 50,
    total_collected: 22000000,
    pending_amount: 0,
    default_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString(),
  },
  {
    id: 'C003',
    name: 'Shreem Nidhi Special (Random)',
    chit_type: 'random',
    status: 'active',
    monthly_contribution: 50000,
    max_members: 10,
    members_count: 8,
    current_month: 3,
    total_months: 10,
    total_collected: 1200000,
    pending_amount: 150000,
    default_count: 3, // CRITICAL RISK
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
  {
    id: 'C004',
    name: 'New Year Premium 500',
    chit_type: 'traditional',
    status: 'forming',
    monthly_contribution: 10000,
    max_members: 50,
    members_count: 42,
    current_month: 0,
    total_months: 50,
    total_collected: 0,
    pending_amount: 0,
    default_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'C005',
    name: 'Completed Legacy Group',
    chit_type: 'traditional',
    status: 'completed',
    monthly_contribution: 5000,
    max_members: 20,
    members_count: 20,
    current_month: 20,
    total_months: 20,
    total_collected: 2000000,
    pending_amount: 0,
    default_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 700).toISOString(),
  },
  {
    id: 'C006',
    name: 'At Risk Auction 100',
    chit_type: 'traditional',
    status: 'active',
    monthly_contribution: 10000,
    max_members: 10,
    members_count: 10,
    current_month: 5,
    total_months: 10,
    total_collected: 300000,
    pending_amount: 100000, // HIGH PENDING
    default_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(),
  }
]

// --- HELPERS --- //

const isDemo = () => typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_demo') === 'true'
const isPro = () => typeof window !== 'undefined' && localStorage.getItem('sreem_nidhi_pro_mode') === 'true'

/**
 * Computes financial health and summary from the contributions table.
 * This is the 'Client-Side Computation' requested by the user.
 */
export const getChitFinancials = async (chitId) => {
  if (isDemo() && !isPro()) {
    const mock = MOCK_CHITS.find(c => c.id === chitId)
    return {
      collected: mock?.total_collected || 0,
      pending: mock?.pending_amount || 0,
      defaults: mock?.default_count || 0
    }
  }

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
    // Database (total_members | max_members | members_limit) -> UI (max_members)
    max_members: chit.total_members || chit.max_members || chit.members_limit || chit.totalMembers,
    // Database (monthly_amount | monthly_contribution) -> UI (monthly_contribution)
    monthly_contribution: chit.monthly_amount || chit.monthly_contribution || chit.monthlyContribution,
    // Database (duration_months | total_months) -> UI (total_months)
    total_months: chit.duration_months || chit.total_months || chit.totalMonths,
    // Ensure membership count is extracted from the join result
    members_count: chit.members_count || chit.chit_members?.[0]?.count || 0,
    // Add camelCase alias for UI components that might expect them
    totalMembers: chit.total_members || chit.max_members || chit.members_limit,
    currentMonth: chit.current_month || 1
  }
}

// --- READS --- //

export const getChits = async () => {
  const proMode = isPro()
  const demoMode = isDemo()

  try {
    const { data: dbChits, error } = await supabase
      .from('chits')
      .select(`
        *,
        chit_members:chit_members(count)
      `)
      .order('created_at', { ascending: false })

    if (error && !demoMode) throw error

    // Load session-stored chits (Demo Mode only)
    let sessionChits = []
    if (demoMode && typeof window !== 'undefined') {
      const stored = localStorage.getItem('sn_demo_chits')
      sessionChits = stored ? JSON.parse(stored) : []
    }

    // Combine Data
    const combined = [...(dbChits || []), ...sessionChits]

    // IF DB EMPTY & DEMO MODE: Return high-fidelity mocks + session chits
    if (combined.length === 0 && demoMode) {
      return MOCK_CHITS.map(mapChit)
    }

    // Normal mapped results
    return combined.map(mapChit)
  } catch (error) {
    if (demoMode && !proMode) return MOCK_CHITS.map(mapChit)
    throw error
  }
}

export const getChitById = async (id) => {
  // Check session chits first
  if (isDemo() && typeof window !== 'undefined') {
    const stored = localStorage.getItem('sn_demo_chits')
    const sessionChits = stored ? JSON.parse(stored) : []
    const match = sessionChits.find(c => c.id === id)
    if (match) return mapChit(match)
    
    // Check mocks
    const mock = MOCK_CHITS.find(c => c.id === id)
    if (mock) return mapChit(mock)
  }

  const { data, error } = await supabase
    .from('chits')
    .select(`*, chit_members (*, profiles (*))`)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapChit(data)
}

/**
 * Full details including aggregated financials and member snapshots.
 */
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
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  return data?.id
}

// --- WRITES --- //

export const createChit = async (chitData) => {
  if (isDemo() && !isPro()) {
    const newChit = {
      ...chitData,
      id: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'forming',
      current_month: 0,
      members_count: 0,
      created_at: new Date().toISOString()
    }
    
    // Persist to session storage so it reflects in the list
    const stored = localStorage.getItem('sn_demo_chits')
    const sessionChits = stored ? JSON.parse(stored) : []
    sessionChits.push(newChit)
    localStorage.setItem('sn_demo_chits', JSON.stringify(sessionChits))
    
    return newChit
  }

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
  if (isDemo() && !isPro()) return true
  const { error } = await supabase.rpc('create_month_contributions', {
    p_chit_id: chitId
  })
  if (error) throw error
}

export const selectWinner = async (chitId) => {
  if (isDemo() && !isPro()) return true
  const { error } = await supabase.rpc('select_winner', {
    p_chit_id: chitId
  })
  if (error) throw error
}

export const openAuction = async (chitId, month) => {
  if (isDemo() && !isPro()) return true
  const { error } = await supabase.rpc('open_auction', {
    p_chit_id: chitId,
    p_month_number: month
  })
  if (error) throw error
}

export const closeAuction = async (auctionRoundId) => {
  if (isDemo() && !isPro()) return true
  const { error } = await supabase.rpc('close_auction', {
    p_auction_round_id: auctionRoundId
  })
  if (error) throw error
}

export const processMaturity = async (chitId) => {
  if (isDemo() && !isPro()) return true
  const { error } = await supabase.rpc('process_maturity', {
    p_chit_id: chitId
  })
  if (error) throw error
}

// Legacy compat object
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
