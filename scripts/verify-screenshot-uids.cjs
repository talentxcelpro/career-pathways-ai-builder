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

const screenshotUids = [
  '3bad0bcc-6da6-4fac-b114-98b3ed3a3397',
  '0d0f3238-5db3-42ce-9020-efae9d967110',
  '921b902c-8e4b-4690-b43a-2b368415349f',
  '1fba8aa5-4a40-4c42-b5bb-60baf964b322',
  '4ea8ded1-be16-4ef1-a165-98d342682641',
  'dfe35ff9-b7ed-474f-b55a-f9e332c96c27',
  '06a84f4f-562d-4f1b-b963-0d0fde5be217',
  '1ec4148b-60ec-4d08-81be-1f78935fe718',
  'c59727f4-9582-4cf2-87b3-16061c75ec51'
];

async function checkScreenshotUsers() {
  const { data: profs } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', screenshotUids);

  console.log('--- SCREENSHOT USERS IN PROFILES (' + (profs ? profs.length : 0) + ') ---');
  profs?.forEach(p => console.log(`  - ${p.id}: ${p.full_name} (${p.email})`));

  const { data: players } = await supabase
    .from('career_players')
    .select('id, display_name')
    .in('id', screenshotUids);

  console.log('\n--- SCREENSHOT USERS ALREADY IN CAREER_PLAYERS (' + (players ? players.length : 0) + ') ---');
  players?.forEach(p => console.log(`  - ${p.id}: ${p.display_name}`));
}

checkScreenshotUsers().catch(console.error);
