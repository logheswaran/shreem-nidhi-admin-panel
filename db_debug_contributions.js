const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://loqejjouklxdfjdztrld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcWVqam91a2x4ZGZqZHp0cmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMzODAsImV4cCI6MjA4Nzg3OTM4MH0.KcQaI5y4Myw-WgUMvOODo10my9bsZH4N-wOHHRrnyF8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('contributions').select('*').order('id', { ascending: true });
  fs.writeFileSync('contributions_debug.json', JSON.stringify({ error, data }, null, 2));
}

run();
