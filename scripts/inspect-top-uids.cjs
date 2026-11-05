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
const supabase = createClient(env.TX_SUPABASE_URL || env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

const topUids = [
  '3bad0bcc-6da6-4fac-b114-98b3ed3a3397',
  '0d0f3238-5db3-42ce-9020-efae9d967110',
  '921b902c-8e4b-4690-b43a-2b368415349f',
  '1fba8aa5-4a40-4c42-b5bb-60baf964b322',
  '4ea8ded1-be16-4ef1-a165-98d342682641',
  'dfe35ff9-b7ed-474f-b55a-f9e332c96c27'
];

async function checkTopUids() {
  for (const uid of topUids) {
    const { data: user } = await supabase.auth.admin.getUserById(uid);
    const { data: prof } = await supabase.from('profiles').select('id, full_name, email, created_at').eq('id', uid).maybeSingle();
    console.log(`UID ${uid}:`);
    console.log(`  auth.user: ${user?.user?.email} (${user?.user?.user_metadata?.full_name}) created: ${user?.user?.created_at}`);
    console.log(`  profiles:  ${prof ? `${prof.full_name} (${prof.created_at})` : 'NOT FOUND IN PROFILES'}`);
  }
}

checkTopUids().catch(console.error);
