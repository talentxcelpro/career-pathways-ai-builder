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

async function inspectOriginal11() {
  const { data: players } = await supabase
    .from('career_players')
    .select('*')
    .gt('xp', 0)
    .order('xp', { ascending: false });

  console.log('Original players with XP > 0:');
  for (const p of players) {
    const { data: u } = await supabase.auth.admin.getUserById(p.id);
    console.log(`- ID: ${p.id} | Name: ${p.display_name} | Email: ${u?.user?.email} | College: ${p.college} | XP: ${p.xp} | Coins: ${p.career_coins} | Created: ${p.created_at}`);
  }
}

inspectOriginal11();
