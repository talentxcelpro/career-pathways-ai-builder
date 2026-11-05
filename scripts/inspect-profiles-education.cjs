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

async function inspectProfiles() {
  // Check college, education, skills, primary_role on profiles
  const { data: p } = await supabase
    .from('profiles')
    .select('id, full_name, username, title, location, primary_role, education, education_history, career_stage')
    .not('education', 'is', null)
    .limit(3);

  console.log('Sample profiles with education:', p);

  // Check how many have education vs null
  const { count: withEdu } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .not('education', 'is', null);

  console.log('Profiles with education populated:', withEdu);

  const { count: withEduHist } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .not('education_history', 'is', null);

  console.log('Profiles with education_history populated:', withEduHist);
}

inspectProfiles().catch(console.error);
