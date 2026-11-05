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
const service = createClient(env.TX_SUPABASE_URL || env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

async function testRLS() {
  console.log('--- TESTING RLS ON CAREER_PLAYERS ---');
  const { data: anonData, error: anonErr } = await anon
    .from('career_players')
    .select('id, display_name, xp, is_public, is_activated');
  
  if (anonErr) {
    console.log('Anon select result: ERROR', anonErr.message);
  } else {
    console.log(`Anon select result: SUCCESS, visible records = ${anonData.length}`);
    anonData.forEach(p => console.log(`  - ${p.display_name}: public=${p.is_public}, active=${p.is_activated}, xp=${p.xp}`));
  }

  // Check anonymous insert attempt (should be blocked by RLS!)
  const { data: anonInsert, error: insertErr } = await anon
    .from('career_players')
    .insert({
      id: '00000000-0000-0000-0000-000000000001',
      display_name: 'Malicious Injected Player',
      xp: 99999
    });
  console.log('Anon insert attempt result (should fail):', insertErr ? `BLOCKED (${insertErr.message})` : 'ALLOWED (SECURITY RISK!)');

  console.log('\n--- CHECKING COIN LEDGER & AUTHORITATIVE REWARD MODEL ---');
  // Check user_txc_balances
  const { data: balances } = await service.from('user_txc_balances').select('*').limit(5);
  console.log('Sample user_txc_balances:', balances);

  // Check txc_transactions
  const { data: txcTx } = await service.from('txc_transactions').select('*').order('created_at', { ascending: false }).limit(3);
  console.log('Recent txc_transactions:', txcTx);

  // Check career_quests
  const { data: quests } = await service.from('career_quests').select('*').limit(5);
  console.log('Sample career_quests:', quests);

  // Check career_guilds
  const { data: guilds } = await service.from('career_guilds').select('*');
  console.log('Career guilds:', guilds);
}

testRLS().catch(console.error);
