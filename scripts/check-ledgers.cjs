const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

for (const line of envText.split('\n')) {
  const t = line.trim();
  if (t.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = t.split('=')[1].replace(/['"]/g, '');
  if (t.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=') || t.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseKey = t.split('=')[1].replace(/['"]/g, '');
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLedgers() {
  const possibleTables = [
    'career_xp_transactions',
    'career_coin_transactions',
    'career_quests',
    'career_skills'
  ];

  for (const t of possibleTables) {
    const { data, error } = await supabase.from(t).select('*').limit(3);
    if (!error) {
      console.log(`Table ${t}: exists, rows:`, data.length);
    } else {
      console.log(`Table ${t}: does not exist (${error.message})`);
    }
  }
}

checkLedgers();
