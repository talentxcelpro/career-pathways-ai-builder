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
const supabase = createClient(env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

async function check() {
  const { count: playerCount, data: players } = await supabase.from('career_players').select('id, display_name, xp, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5);
  console.log('Total players in career_players:', playerCount);
  console.log('Most recent players in career_players:', players);

  const { count: profileCount, data: profiles } = await supabase.from('profiles').select('id, full_name, username, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5);
  console.log('Total profiles in profiles:', profileCount);
  console.log('Most recent profiles:', profiles);

  // Check if recent profiles exist in career_players
  if (profiles && profiles.length > 0) {
    for (const p of profiles) {
      const { data: cp } = await supabase.from('career_players').select('id, display_name, xp').eq('id', p.id).maybeSingle();
      console.log(`Profile ${p.full_name} (${p.id}) has career_player:`, cp ? 'YES' : 'NO');
    }
  }
}
check();
