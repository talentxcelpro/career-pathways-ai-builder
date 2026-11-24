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

async function inspectAndActivate() {
  console.log('=== INSPECTING JOB APPLICATIONS & CANDIDATE ACTIVATION ===');

  const { data: apps, count: appCount, error: appErr } = await supabase
    .from('job_applications')
    .select('id, user_id, job_id, cover_letter, resume_url, applied_at', { count: 'exact' });

  console.log(`Total DB job_applications: ${appCount || 0}, Error: ${appErr ? appErr.message : 'none'}`);
  if (apps && apps.length > 0) {
    console.log('Sample application:', apps[0]);
  }

  // Check profiles with missing fields
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, username, headline, location, skills, bio, phone, created_at');

  console.log(`Total Profiles in DB: ${profiles?.length || 0}`);
  const missingHeadline = (profiles || []).filter(p => !p.headline || p.headline.trim() === '');
  const missingLocation = (profiles || []).filter(p => !p.location || p.location.trim() === '');
  const missingSkills = (profiles || []).filter(p => !p.skills || !Array.isArray(p.skills) || p.skills.length === 0);

  console.log(`Profiles Missing Headline: ${missingHeadline.length} / ${profiles?.length}`);
  console.log(`Profiles Missing Location: ${missingLocation.length} / ${profiles?.length}`);
  console.log(`Profiles Missing Skills: ${missingSkills.length} / ${profiles?.length}`);

  // Also check if any applications can be parsed to backfill user profiles
  let activatableFromApps = 0;
  if (apps && apps.length > 0) {
    for (const app of apps) {
      if (!app.user_id) continue;
      const prof = (profiles || []).find(p => p.id === app.user_id);
      if (!prof) continue;

      const needsHeadline = !prof.headline || prof.headline.trim() === '';
      const needsLocation = !prof.location || prof.location.trim() === '';
      if (needsHeadline || needsLocation) {
        activatableFromApps++;
      }
    }
  }
  console.log(`Candidates activatable directly from application records: ${activatableFromApps}`);
}

inspectAndActivate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
