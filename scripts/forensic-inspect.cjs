const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const supabase = createClient(env.TX_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

async function inspect() {
  console.log('=== FORENSIC INSPECTION ===');
  
  // 1. Profiles
  const { data: p, error: pe } = await supabase.from('profiles').select('*').limit(2);
  if (pe) console.log('Profiles error:', pe);
  else {
    console.log('Profiles total columns count:', Object.keys(p[0] || {}).length);
    console.log('Profiles columns:', Object.keys(p[0] || {}));
    console.log('Sample profile:', JSON.stringify(p[0], null, 2));
  }

  // 2. Jobs
  const { data: j, error: je } = await supabase.from('jobs').select('*').limit(1);
  if (je) console.log('Jobs error:', je);
  else {
    console.log('\nJobs total columns count:', Object.keys(j[0] || {}).length);
    console.log('Jobs columns:', Object.keys(j[0] || {}));
    console.log('Sample job:', JSON.stringify(j[0], null, 2));
  }

  // 3. Posts
  const { data: po, error: poe } = await supabase.from('posts').select('*').limit(1);
  if (poe) console.log('Posts error:', poe);
  else {
    console.log('\nPosts total columns count:', Object.keys(po[0] || {}).length);
    console.log('Posts columns:', Object.keys(po[0] || {}));
    console.log('Sample post:', JSON.stringify(po[0], null, 2));
  }

  // 4. Communities / Groups / Network connections
  const { data: grp, error: ge } = await supabase.from('groups').select('*').limit(2);
  console.log('\nGroups:', grp, ge);

  // 5. Connections / follow / requests
  const checkOtherTables = ['user_connections', 'connections', 'follows', 'network_requests', 'user_referrals', 'referral_codes'];
  for (const t of checkOtherTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (!error) console.log(`Table '${t}' exists with count:`, count);
  }
}

inspect().catch(console.error);
