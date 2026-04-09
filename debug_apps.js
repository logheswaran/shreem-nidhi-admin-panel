import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://loqejjouklxdfjdztrld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcWVqam91a2x4ZGZqZHp0cmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMzODAsImV4cCI6MjA4Nzg3OTM4MH0.KcQaI5y4Myw-WgUMvOODo10my9bsZH4N-wOHHRrnyF8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugApplications() {
  console.log('Fetching member_applications...')
  const { data, error } = await supabase
    .from('member_applications')
    .select('*, profiles:user_id(*), chits:chit_id(*)')
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Count:', data?.length)
    console.log('Sample data:', JSON.stringify(data?.[0], null, 2))
  }
}

debugApplications()
