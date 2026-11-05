const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
  const env = {};
  ['.env', '.env.local'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          let key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          env[key] = val;
        }
      });
    }
  });
  return env;
}

const env = loadEnv();
const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function testLeaderboardQuery() {
  console.log('Testing competitive leaderboard query (is_public=true, is_activated=true, xp > 0)...');
  const { data: competitive, error: cErr } = await anon
    .from('career_players')
    .select('id, display_name, xp, level')
    .eq('is_public', true)
    .eq('is_activated', true)
    .gt('xp', 0)
    .order('xp', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(20);

  if (cErr) {
    console.error('Error in competitive query:', cErr);
  } else {
    console.log(`Competitive Leaderboard Players returned: ${competitive.length}`);
    competitive.forEach((p, idx) => console.log(`  Rank ${idx + 1}: ${p.display_name} (${p.xp} XP, Lvl ${p.level})`));
  }

  console.log('\nTesting recently joined query (is_public=true, order by created_at desc)...');
  const { data: recent, error: rErr } = await anon
    .from('career_players')
    .select('id, display_name, xp, level, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (rErr) {
    console.error('Error in recently joined query:', rErr);
  } else {
    console.log(`Recently Joined Players returned: ${recent.length}`);
    recent.forEach((p, idx) => console.log(`  [${idx + 1}] ${p.display_name} (${p.created_at})`));
  }
}

testLeaderboardQuery().catch(console.error);
