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
const ADMIN_ID = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062';

async function testActivate() {
  const { data, error } = await supabase.rpc('activate_career_player', {
    p_user_id: ADMIN_ID,
    p_display_name: 'TalentXcel Admin'
  });
  console.log('activate_career_player result:', data, 'Error:', error?.message);
}

testActivate().catch(console.error);
