const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
let key = '', url = '';
for (const l of lines) {
  const trimmed = l.trim();
  if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) key = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  if (trimmed.startsWith('TX_SUPABASE_URL=')) url = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
}
const s = createClient(url, key);

async function run() {
  const { data, error } = await s.from('jobs').select('*').limit(1);
  if (error) {
    console.error('Error fetching jobs:', error);
  } else {
    console.log('Jobs columns count:', Object.keys(data[0]).length);
    console.log('Columns:', Object.keys(data[0]));
    console.log('Sample record id type:', typeof data[0].id, data[0].id);
  }
}

run();
