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

const url = env.TX_SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.TALENTXCEL_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(url, key);

async function probe() {
  const tables = [
    'profiles', 'jobs', 'network_connections', 'network_posts', 'posts', 
    'communities', 'groups', 'discussions', 'referrals', 'cities', 
    'locations', 'distribution_campaigns', 'page_views', 'growth_analytics',
    'user_referrals', 'viral_invitations', 'profile_visits', 'user_presence',
    'skills', 'categories', 'articles', 'events', 'embed_distribution_jobs',
    'embed_growth_metrics', 'subscribers', 'newsletter_subscribers', 'analytics'
  ];
  const results = {};
  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        results[t] = { status: 'error', message: error.message };
      } else {
        results[t] = { status: 'exists', count };
      }
    } catch (e) {
      results[t] = { status: 'exception', message: e.message };
    }
  }

  // Also query information_schema or sample profiles
  const { data: sampleProfiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, headline, location, country, city, industry, skills, is_public, verified, created_at')
    .limit(5);

  const { data: sampleJobs, error: jErr } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, city, country, job_type, experience_level, industry, is_active, created_at')
    .limit(5);

  // Check unique locations in profiles and jobs
  const { data: profileLocations } = await supabase
    .from('profiles')
    .select('location')
    .not('location', 'is', null)
    .limit(100);

  const { data: jobLocations } = await supabase
    .from('jobs')
    .select('location')
    .not('location', 'is', null)
    .limit(100);

  console.log(JSON.stringify({
    tables: results,
    sampleProfiles,
    sampleJobs,
    profileLocationsSample: profileLocations ? [...new Set(profileLocations.map(p => p.location))].slice(0, 20) : [],
    jobLocationsSample: jobLocations ? [...new Set(jobLocations.map(j => j.location))].slice(0, 20) : []
  }, null, 2));
}

probe().catch(console.error);
