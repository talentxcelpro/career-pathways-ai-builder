const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
let key = '';
envContent.split('\n').forEach(l => {
  if (l.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
    key = l.substring('TALENTXCEL_SERVICE_ROLE_KEY='.length).trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient('https://dthlgsnakhoftinssokm.supabase.co', key);

async function inspectPlayers() {
  const { data, error } = await supabase
    .from('career_players')
    .select('id, display_name, career_title, college, xp, level, stats')
    .order('xp', { ascending: false });

  if (error) {
    console.error('Error fetching career_players:', error.message);
  } else {
    console.log(`Found ${data.length} players in career_players:`);
    data.forEach((p, idx) => {
      console.log(`  #${idx + 1}: ${p.display_name} (${p.career_title}) — ${p.xp} XP (Level ${p.level}), stats:`, p.stats);
    });
  }
}

inspectPlayers().catch(console.error);
