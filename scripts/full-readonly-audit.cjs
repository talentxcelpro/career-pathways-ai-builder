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

async function runAudit() {
  console.log('================================================================');
  console.log('🔍 TALENTXCEL READ-ONLY DATABASE AUDIT: PROFILES & CAREER_PLAYERS');
  console.log('================================================================\n');

  // 1. Fetch sample career_players record to inspect columns & types
  const { data: samplePlayers, error: cpErr } = await supabase
    .from('career_players')
    .select('*')
    .limit(5);

  if (cpErr) {
    console.error('Error querying career_players:', cpErr);
  } else {
    console.log('--- CAREER_PLAYERS COLUMNS & SAMPLE VALUES ---');
    if (samplePlayers.length > 0) {
      const keys = Object.keys(samplePlayers[0]);
      console.log('Columns detected in career_players (' + keys.length + '):');
      keys.forEach(k => {
        const val = samplePlayers[0][k];
        console.log(`  - ${k}: typeof = ${typeof val}, sample = ${JSON.stringify(val)?.slice(0, 50)}`);
      });
    } else {
      console.log('No rows in career_players');
    }
  }

  // 2. Fetch sample profiles record to inspect columns & types
  const { data: sampleProfiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profErr) {
    console.error('Error querying profiles:', profErr);
  } else {
    console.log('\n--- PROFILES COLUMNS & SAMPLE VALUES ---');
    if (sampleProfiles.length > 0) {
      const keys = Object.keys(sampleProfiles[0]);
      console.log('Columns detected in profiles (' + keys.length + '):');
      keys.forEach(k => {
        const val = sampleProfiles[0][k];
        console.log(`  - ${k}: typeof = ${typeof val}`);
      });
    }
  }

  // 3. Inspect existing career_players records completely
  const { data: allPlayers, count: totalPlayerCount } = await supabase
    .from('career_players')
    .select('*', { count: 'exact' });

  console.log(`\n--- ALL EXISTING CAREER_PLAYERS (${totalPlayerCount || 0}) ---`);
  if (allPlayers) {
    allPlayers.forEach((p, idx) => {
      console.log(`[${idx + 1}] ID: ${p.id} | Name: "${p.display_name}" | XP: ${p.xp} | Coins: ${p.career_coins} | Lvl: ${p.level} | Streak: ${p.streak_count} | Active: ${p.is_activated} | Public: ${p.is_public} | Created: ${p.created_at}`);
    });
  }

  // 4. Fetch all Auth users
  console.log('\n--- FETCHING ALL AUTH.USERS VIA ADMIN API ---');
  let authUsers = [];
  let page = 1;
  while (true) {
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (authErr) {
      console.error('Error fetching auth users page ' + page + ':', authErr);
      break;
    }
    authUsers.push(...authData.users);
    if (authData.users.length < 1000) break;
    page++;
  }
  console.log(`Total auth.users retrieved: ${authUsers.length}`);

  const authUserMap = new Map();
  authUsers.forEach(u => authUserMap.set(u.id, u));

  // 5. Fetch all Profiles
  console.log('\n--- FETCHING ALL PROFILES ---');
  let allProfiles = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data: batch, error: bErr } = await supabase
      .from('profiles')
      .select('id, email, username, full_name, created_at, updated_at, user_role')
      .range(from, from + batchSize - 1);
    if (bErr) {
      console.error('Error fetching profiles batch:', bErr);
      break;
    }
    allProfiles.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }
  console.log(`Total profiles retrieved: ${allProfiles.length}`);

  // 6. Cross-reference Profiles vs Auth Users
  const profilesLinkedToAuth = [];
  const profilesNotLinkedToAuth = [];

  allProfiles.forEach(p => {
    if (authUserMap.has(p.id)) {
      profilesLinkedToAuth.push(p);
    } else {
      profilesNotLinkedToAuth.push(p);
    }
  });

  console.log(`\n--- PROFILE <-> AUTH RECONCILIATION ---`);
  console.log(`Total profiles: ${allProfiles.length}`);
  console.log(`Profiles linked to auth.users (id match): ${profilesLinkedToAuth.length}`);
  console.log(`Profiles NOT linked to auth.users (orphan/synthetic): ${profilesNotLinkedToAuth.length}`);

  // 7. Cross-reference with career_players
  const playerMap = new Map();
  allPlayers.forEach(p => playerMap.set(p.id, p));

  const authLinkedProfilesWithPlayer = [];
  const authLinkedProfilesMissingPlayer = [];

  profilesLinkedToAuth.forEach(p => {
    if (playerMap.has(p.id)) {
      authLinkedProfilesWithPlayer.push(p);
    } else {
      authLinkedProfilesMissingPlayer.push(p);
    }
  });

  console.log(`\n--- GAMIFICATION ONBOARDING STATUS FOR AUTH-LINKED PROFILES ---`);
  console.log(`Auth-linked profiles ALREADY having career_players: ${authLinkedProfilesWithPlayer.length}`);
  console.log(`Auth-linked profiles MISSING career_players (Eligible cohort): ${authLinkedProfilesMissingPlayer.length}`);

  // 8. Inspect players that do not belong to auth.users or profiles
  const playersNotInAuth = [];
  const playersNotInProfiles = [];
  const profileIdSet = new Set(allProfiles.map(p => p.id));

  allPlayers.forEach(p => {
    if (!authUserMap.has(p.id)) playersNotInAuth.push(p);
    if (!profileIdSet.has(p.id)) playersNotInProfiles.push(p);
  });

  console.log(`\n--- INTEGRITY OF EXISTING CAREER_PLAYERS RECORDS ---`);
  console.log(`Players without matching auth.users: ${playersNotInAuth.length}`);
  if (playersNotInAuth.length > 0) {
    playersNotInAuth.forEach(p => console.log(`  - Invalid/Non-auth Player ID: ${p.id} (${p.display_name})`));
  }
  console.log(`Players without matching profiles: ${playersNotInProfiles.length}`);
  if (playersNotInProfiles.length > 0) {
    playersNotInProfiles.forEach(p => console.log(`  - Orphan Player ID: ${p.id} (${p.display_name})`));
  }

  // 9. Inspect Coin & XP Ledgers in Database
  console.log('\n--- CHECKING TRANSACTION LEDGERS IN DATABASE ---');
  const ledgersToCheck = [
    'txc_transactions',
    'career_coin_transactions',
    'career_xp_transactions',
    'career_player_activities',
    'user_txc_balances',
    'career_quests',
    'career_user_quests',
    'career_guilds',
    'career_tree_skills',
    'career_user_skills'
  ];

  for (const table of ledgersToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`  - ${table}: Error / Does not exist (${error.message})`);
      } else {
        console.log(`  - ${table}: EXISTS, total rows = ${count}`);
      }
    } catch (e) {
      console.log(`  - ${table}: Exception (${e.message})`);
    }
  }

  // 10. Check trigger status on profiles table
  console.log('\n--- CHECKING FOR USER-CREATED TRIGGER FUNCTION ---');
  // Attempt to call RPC or inspect functions if possible
  try {
    const { data: testRpc, error: rpcErr } = await supabase.rpc('handle_new_player_registration');
    console.log('Function handle_new_player_registration exists test:', rpcErr ? rpcErr.message : 'Callable');
  } catch (err) {
    console.log('Function check exception:', err.message);
  }
}

runAudit().catch(console.error);
