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

async function findTalentXcelServices() {
  const { data: profiles } = await supabase.from('profiles').select('*').ilike('full_name', '%TalentXcel%');
  console.log('Profiles matching TalentXcel:');
  profiles?.forEach(p => console.log('ID:', p.id, 'Full Name:', p.full_name, 'Email:', p.email, 'Skills:', p.skills, 'Headline:', p.headline));
}

findTalentXcelServices().catch(console.error);
