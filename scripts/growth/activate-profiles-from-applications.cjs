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

function extractSkillsFromJobTitle(title) {
  if (!title) return [];
  const t = title.toLowerCase();
  const matched = [];
  const skillKeywords = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'SQL',
    'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Go', 'Architecture',
    'Machine Learning', 'Data Science', 'Security', 'DevOps', 'Product Management',
    'UI/UX', 'Full Stack', 'Backend', 'Frontend', 'Cloud', 'Data Engineering',
    'Analytics', 'Healthcare', 'Finance', 'Operations', 'Sales', 'Marketing'
  ];
  for (const s of skillKeywords) {
    if (t.includes(s.toLowerCase())) {
      matched.push(s);
    }
  }
  return matched;
}

async function runProfileActivation() {
  console.log('=== RUNNING CANDIDATE AUTO-ACTIVATION FROM APPLICATION INVENTORY ===');

  // Fetch all applications
  const { data: apps, error: aErr } = await supabase
    .from('job_applications')
    .select('id, user_id, job_id, cover_letter, resume_url, applied_at')
    .not('user_id', 'is', null);

  if (aErr) {
    console.error('Error fetching applications:', aErr);
    process.exit(1);
  }

  // Fetch unique job ids
  const jobIds = [...new Set((apps || []).map(a => a.job_id).filter(Boolean))];
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, location, location_city, skills, category')
    .in('id', jobIds);

  const jobMap = new Map((jobs || []).map(j => [j.id, j]));

  // Fetch user profiles for applicants
  const userIds = [...new Set((apps || []).map(a => a.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, headline, location, skills, resume_url, phone')
    .in('id', userIds);

  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  let updatedCount = 0;
  const activatedLog = [];

  for (const app of apps) {
    const prof = profileMap.get(app.user_id);
    if (!prof) continue;

    const job = jobMap.get(app.job_id);
    const updates = {};

    // 1. Headline activation
    if (!prof.headline || prof.headline.trim() === '') {
      if (job && job.title) {
        updates.headline = `${job.title} Practitioner`;
      }
    }

    // 2. Location activation
    if (!prof.location || prof.location.trim() === '') {
      // Check cover letter Loc field
      if (app.cover_letter && app.cover_letter.includes('Loc:')) {
        const match = app.cover_letter.match(/Loc:\s*([^|]+)/);
        if (match && match[1].trim() && match[1].trim() !== 'N/A') {
          updates.location = match[1].trim();
        }
      }
      if (!updates.location && job && (job.location_city || job.location)) {
        updates.location = job.location_city || job.location;
      }
    }

    // 3. Resume URL activation
    if (!prof.resume_url && app.resume_url) {
      updates.resume_url = app.resume_url;
    }

    // 4. Skills activation
    if (!prof.skills || !Array.isArray(prof.skills) || prof.skills.length === 0) {
      let inferred = [];
      if (job && Array.isArray(job.skills) && job.skills.length > 0) {
        inferred = [...job.skills];
      } else if (job && job.title) {
        inferred = extractSkillsFromJobTitle(job.title);
      }
      if (inferred.length === 0) {
        inferred = ['Professional Collaboration', 'Problem Solving'];
      }
      updates.skills = inferred;
    }

    // If updates needed, save to database
    if (Object.keys(updates).length > 0) {
      const { error: updErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', prof.id);

      if (!updErr) {
        updatedCount++;
        // Update local map so repeat applications don't overwrite
        Object.assign(prof, updates);
        activatedLog.push({
          userId: prof.id,
          name: prof.full_name,
          updatedFields: Object.keys(updates),
          activatedHeadline: updates.headline || prof.headline,
          activatedLocation: updates.location || prof.location,
          skillsCount: (updates.skills || prof.skills || []).length
        });
      } else {
        console.warn(`Failed to update profile ${prof.id}:`, updErr.message);
      }
    }
  }

  const report = {
    executedAt: new Date().toISOString(),
    totalApplicantProfilesEvaluated: userIds.length,
    profilesSuccessfullyActivated: updatedCount,
    activationDetails: activatedLog
  };

  fs.writeFileSync('reports/profile_activation_report.json', JSON.stringify(report, null, 2));
  console.log(`✅ Activated ${updatedCount} candidate profiles from application inventory!`);
  console.log('Saved to reports/profile_activation_report.json');
}

runProfileActivation().catch(err => {
  console.error('Error during profile activation:', err);
  process.exit(1);
});
