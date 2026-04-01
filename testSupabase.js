import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://loqejjouklxdfjdztrld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcWVqam91a2x4ZGZqZHp0cmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMzODAsImV4cCI6MjA4Nzg3OTM4MH0.KcQaI5y4Myw-WgUMvOODo10my9bsZH4N-wOHHRrnyF8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing connection to Supabase...')
  const { data, error } = await supabase.from('chits').select('*').limit(1)
  if (error) {
    console.error('Error fetching from live database:', error)
    if (error.code === '42P01') {
      console.log('Result: The "chits" table does not exist. The schema and RPCs need to be applied in the Supabase SQL Editor.')
    }
  } else {
    console.log('Connection successful! The "chits" table exists.')
    console.log('Data:', data)
    
    // Also test an RPC
    const { error: rpcError } = await supabase.rpc('get_dashboard_stats', {})
    if (rpcError) {
        console.error('Testing RPC: Error:', rpcError)
    } else {
        console.log('RPC exists and is working.')
    }
  }
}

testConnection()
