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
const supabaseAnon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const supabaseService = createClient(env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);
const ADMIN_ID = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062';

async function testUpdatePlayer() {
  // Check read with anon
  const { data: readAnon, error: rErr } = await supabaseAnon.from('career_players').select('*').limit(3);
  console.log('Read with anon:', readAnon?.length, 'Error:', rErr?.message);

  // Check update with service
  const { data: updateData, error: uErr } = await supabaseService
    .from('career_players')
    .update({ xp: 50, level: 1 })
    .eq('id', ADMIN_ID)
    .select('*');
  console.log('Update with service:', updateData, 'Error:', uErr?.message);
}

testUpdatePlayer().catch(console.error);
