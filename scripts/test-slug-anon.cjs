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
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.TALENTXCEL_SERVICE_ROLE_KEY;
const supabase = createClient(env.VITE_SUPABASE_URL, supabaseKey);

async function testSlug() {
  const cleanSlug = 'lifeislove83934f40a0';
  const nameQuery = cleanSlug.replace(/-/g, ' ');
  const compactUsername = cleanSlug.replace(/-/g, '');
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

  const conditions = [
    `slug.ilike.${cleanSlug}`,
    `custom_profile_url.ilike.${cleanSlug}`,
    `custom_url_slug.ilike.${cleanSlug}`,
    `username.ilike.${cleanSlug}`,
    `username.ilike.${compactUsername}`,
    `full_name.ilike.${nameQuery}`,
    `email.ilike.${cleanSlug}@%`
  ];

  const matchSuffix = cleanSlug.match(/^(.+?)[-_]?([a-f0-9]{6})$/i);
  if (matchSuffix) {
    const prefix = matchSuffix[1];
    const hex = matchSuffix[2];
    conditions.push(`username.ilike.${prefix}_${hex}`);
    conditions.push(`username.ilike.${prefix}${hex}`);
    conditions.push(`email.ilike.${prefix}@%`);
  }

  console.log('Querying with anon key...');
  console.log('Conditions:', conditions.join(','));
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(conditions.join(','))
    .limit(1)
    .maybeSingle();

  console.log('Result with anon key:');
  console.log('Error:', error);
  console.log('Data:', data ? { id: data.id, full_name: data.full_name, username: data.username } : null);
}

testSlug();
