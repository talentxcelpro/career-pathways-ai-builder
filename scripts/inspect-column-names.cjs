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

async function check() {
  const { data } = await supabase.from('profiles').select('*').limit(1);
  const keys = Object.keys(data[0]);
  console.log('Total columns in profiles:', keys.length);
  console.log('Does profiles have college?:', keys.includes('college'));
  console.log('Does profiles have location?:', keys.includes('location'));
  console.log('Does profiles have username?:', keys.includes('username'));
  console.log('Does profiles have full_name?:', keys.includes('full_name'));
  console.log('Does profiles have email?:', keys.includes('email'));
  console.log('Does profiles have title?:', keys.includes('title'));
  console.log('Does profiles have industry?:', keys.includes('industry'));
  console.log('Does profiles have primary_role?:', keys.includes('primary_role'));
  console.log('Does profiles have user_role?:', keys.includes('user_role'));
  console.log('Does profiles have is_profile_public?:', keys.includes('is_profile_public'));
  console.log('Does profiles have education?:', keys.includes('education'));
  console.log('Does profiles have education_history?:', keys.includes('education_history'));
}
check().catch(console.error);
