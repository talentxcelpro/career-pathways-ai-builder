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
const supabase = createClient(env.TX_SUPABASE_URL || env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('--- RE-CALCULATING ELIGIBLE COHORT (SNAPSHOT AS OF ' + new Date().toISOString() + ') ---');

  // 1. Fetch all auth.users
  const authUsers = [];
  let page = 1;
  while (true) {
    const { data: pageData, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error('Error fetching auth users:', error);
      break;
    }
    authUsers.push(...pageData.users);
    if (pageData.users.length < 1000) break;
    page++;
  }
  const authUserSet = new Set(authUsers.map(u => u.id));
  console.log('Total auth.users:', authUsers.length);

  // 2. Fetch all profiles
  const allProfiles = [];
  let from = 0;
  const chunk = 1000;
  while (true) {
    const { data: batch, error } = await supabase
      .from('profiles')
      .select('id, email, username, full_name, title, industry, created_at, is_profile_public')
      .range(from, from + chunk - 1);
    if (error) {
      console.error('Error fetching profiles:', error);
      break;
    }
    allProfiles.push(...batch);
    if (batch.length < chunk) break;
    from += chunk;
  }
  console.log('Total profiles:', allProfiles.length);

  // 3. Fetch all career_players
  const { data: allPlayers } = await supabase.from('career_players').select('id, xp, display_name, career_coins, level');
  const playerSet = new Set(allPlayers.map(p => p.id));
  console.log('Total career_players:', allPlayers.length);

  // 4. Calculate cohorts
  const authLinkedProfiles = allProfiles.filter(p => authUserSet.has(p.id));
  const unlinkedProfiles = allProfiles.filter(p => !authUserSet.has(p.id));

  const eligibleProfilesMissingPlayer = authLinkedProfiles.filter(p => !playerSet.has(p.id));
  const authLinkedProfilesWithPlayer = authLinkedProfiles.filter(p => playerSet.has(p.id));

  console.log('\n--- EXACT VERIFIED COUNTS ---');
  console.log('1. Total Profiles:', allProfiles.length);
  console.log('2. Profiles linked to auth.users:', authLinkedProfiles.length);
  console.log('3. Profiles NOT linked to auth.users (unlinked/orphan):', unlinkedProfiles.length);
  console.log('4. Total existing career_players:', allPlayers.length);
  console.log('5. Auth-linked profiles already with player:', authLinkedProfilesWithPlayer.length);
  console.log('6. Auth-linked profiles MISSING player (Eligible Backfill Cohort):', eligibleProfilesMissingPlayer.length);

  // 5. Inspect players with XP and coins
  const playersWithXP = allPlayers.filter(p => p.xp > 0);
  const playersWithZeroXP = allPlayers.filter(p => p.xp === 0);
  console.log('\nExisting players with XP > 0:', playersWithXP.length);
  playersWithXP.sort((a,b) => b.xp - a.xp).forEach((p, i) => console.log(`  [${i+1}] ${p.display_name}: XP=${p.xp}, Coins=${p.career_coins}, Level=${p.level}`));
  console.log('Existing players with XP = 0:', playersWithZeroXP.length);
  playersWithZeroXP.forEach(p => console.log(`  - ${p.display_name}: XP=0`));
}

run().catch(console.error);
