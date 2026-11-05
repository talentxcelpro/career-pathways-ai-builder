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

async function inspect() {
  console.log('--- 1. TESTING ACCESS TO information_schema VIA POSTGREST ---');
  // Try querying information_schema if exposed
  const { data: cols, error: cErr } = await supabase
    .from('columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .in('table_name', ['profiles', 'career_players']);
  
  if (cErr) {
    console.log('information_schema.columns via REST:', cErr.message);
  } else {
    console.log('information_schema.columns returned rows:', cols?.length);
  }

  // 2. Fallback: inspect actual table data records to inspect every column type
  console.log('\n--- 2. INSPECTING PROFILES TABLE FIELDS ---');
  const { data: pData, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, username, email, title, industry, profile_picture_url, created_at, location, primary_role, is_profile_public')
    .limit(3);

  if (pErr) {
    console.error('Error querying profiles specified fields:', pErr);
  } else {
    console.log('Successfully queried all 11 specified fields from public.profiles:');
    pData.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, {
        id: row.id,
        full_name: row.full_name,
        username: row.username,
        email: row.email,
        title: row.title,
        industry: row.industry,
        profile_picture_url: row.profile_picture_url ? row.profile_picture_url.slice(0, 30) + '...' : null,
        created_at: row.created_at,
        location: row.location,
        is_profile_public: row.is_profile_public
      });
    });
  }

  console.log('\n--- 3. INSPECTING CAREER_PLAYERS DESTINATION FIELDS ---');
  const { data: cpData, error: cpErr } = await supabase
    .from('career_players')
    .select('*')
    .limit(1);

  if (cpErr) {
    console.error('Error querying career_players:', cpErr);
  } else {
    console.log('career_players fields & types:');
    const row = cpData[0];
    Object.keys(row).forEach(k => {
      console.log(`  - ${k}: typeof = ${typeof row[k]}, value = ${JSON.stringify(row[k])?.slice(0, 40)}`);
    });
  }

  console.log('\n--- 4. TESTING IF "internal" SCHEMA OR FUNCTIONS EXIST ---');
  const { data: intCheck, error: intErr } = await supabase
    .from('internal.handle_new_player_registration')
    .select('*')
    .limit(1);
  console.log('internal query result/error:', intErr ? intErr.message : 'Accessible');
}

inspect().catch(console.error);
