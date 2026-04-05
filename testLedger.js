const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://loqejjouklxdfjdztrld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcWVqam91a2x4ZGZqZHp0cmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMzODAsImV4cCI6MjA4Nzg3OTM4MH0.KcQaI5y4Myw-WgUMvOODo10my9bsZH4N-wOHHRrnyF8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.from('ledger').select('transaction_type, reference_type, amount, created_at, chit_id').limit(50)
  console.log('Error:', error)
  console.log('Ledger items:', JSON.stringify(data, null, 2))
}

check()
