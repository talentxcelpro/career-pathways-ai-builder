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

async function runForensicAudit() {
  const report = {};

  // 1. Database Table Counts & Health
  const tables = [
    'profiles', 'jobs', 'posts', 'connections', 'user_presence',
    'groups', 'skills', 'user_referrals', 'subscribers',
    'profile_visits', 'job_applications', 'comments', 'likes'
  ];
  report.tables = {};
  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      report.tables[t] = error ? { error: error.message } : { count };
    } catch (e) {
      report.tables[t] = { exception: e.message };
    }
  }

  // 2. Profiles Deep Dive
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, headline, location, industry, skills, is_profile_public, profile_visibility, allow_profile_sharing, verification_status, career_stage, username, slug, created_at, last_seen')
    .limit(1000);

  if (profiles) {
    const total = profiles.length;
    const withLocation = profiles.filter(p => p.location && p.location.trim().length > 0).length;
    const withSkills = profiles.filter(p => p.skills && (Array.isArray(p.skills) ? p.skills.length > 0 : p.skills.trim().length > 0)).length;
    const withHeadline = profiles.filter(p => p.headline && p.headline.trim().length > 0).length;
    const withIndustry = profiles.filter(p => p.industry && p.industry.trim().length > 0).length;
    const publicProfiles = profiles.filter(p => p.is_profile_public === true || p.profile_visibility === 'public').length;
    const verifiedProfiles = profiles.filter(p => p.verification_status === 'verified').length;
    const withUsername = profiles.filter(p => p.username && p.username.trim().length > 0).length;
    const withSlug = profiles.filter(p => p.slug && p.slug.trim().length > 0).length;

    // Career stages
    const careerStages = {};
    profiles.forEach(p => {
      const cs = p.career_stage || 'unspecified';
      careerStages[cs] = (careerStages[cs] || 0) + 1;
    });

    // Locations top 20
    const locMap = {};
    profiles.forEach(p => {
      if (p.location && p.location.trim()) {
        const norm = p.location.trim();
        locMap[norm] = (locMap[norm] || 0) + 1;
      }
    });
    const topLocations = Object.entries(locMap).sort((a, b) => b[1] - a[1]).slice(0, 20);

    // Industries top 15
    const indMap = {};
    profiles.forEach(p => {
      if (p.industry && p.industry.trim()) {
        const norm = p.industry.trim();
        indMap[norm] = (indMap[norm] || 0) + 1;
      }
    });
    const topIndustries = Object.entries(indMap).sort((a, b) => b[1] - a[1]).slice(0, 15);

    // Skills breakdown
    const skillMap = {};
    profiles.forEach(p => {
      if (p.skills) {
        const sks = Array.isArray(p.skills) ? p.skills : p.skills.split(',').map(s => s.trim());
        sks.forEach(s => {
          if (s) skillMap[s] = (skillMap[s] || 0) + 1;
        });
      }
    });
    const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 20);

    report.profilesAudit = {
      totalSampled: total,
      withLocation,
      withSkills,
      withHeadline,
      withIndustry,
      publicProfiles,
      verifiedProfiles,
      withUsername,
      withSlug,
      careerStages,
      topLocations,
      topIndustries,
      topSkills
    };
  }

  // 3. Jobs & Internships Deep Dive
  const { data: jobs, error: jErr } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, job_type, experience_level, industry, is_active, job_status, created_at')
    .limit(5000);

  if (jobs) {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.is_active === true && j.job_status !== 'closed' && j.job_status !== 'expired').length;
    const internships = jobs.filter(j => (j.job_type && j.job_type.toLowerCase().includes('intern')) || (j.title && j.title.toLowerCase().includes('intern'))).length;
    const freshers = jobs.filter(j => (j.experience_level && (j.experience_level.toLowerCase().includes('fresher') || j.experience_level.toLowerCase().includes('entry'))) || (j.title && j.title.toLowerCase().includes('fresher'))).length;
    
    const jobLocMap = {};
    jobs.forEach(j => {
      const loc = j.location_city || j.location;
      if (loc && loc.trim()) {
        const norm = loc.trim();
        jobLocMap[norm] = (jobLocMap[norm] || 0) + 1;
      }
    });
    const topJobLocations = Object.entries(jobLocMap).sort((a, b) => b[1] - a[1]).slice(0, 25);

    report.jobsAudit = {
      totalJobs,
      activeJobs,
      internships,
      freshers,
      topJobLocations
    };
  }

  // 4. Posts & Discussions Deep Dive
  const { data: posts, error: poErr } = await supabase
    .from('posts')
    .select('id, user_id, content, post_type, is_public, likes_count, comments_count, views_count, status, created_at')
    .limit(3000);

  if (posts) {
    const totalPosts = posts.length;
    const publicPosts = posts.filter(p => p.is_public === true).length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const withLikes = posts.filter(p => p.likes_count > 0).length;
    const withComments = posts.filter(p => p.comments_count > 0).length;
    const postTypes = {};
    posts.forEach(p => {
      const pt = p.post_type || 'unspecified';
      postTypes[pt] = (postTypes[pt] || 0) + 1;
    });
    const uniqueAuthors = new Set(posts.map(p => p.user_id)).size;

    report.postsAudit = {
      totalPosts,
      publicPosts,
      publishedPosts,
      uniqueAuthors,
      withLikes,
      withComments,
      postTypes
    };
  }

  // 5. Connections Deep Dive
  const { data: connections, error: cErr } = await supabase
    .from('connections')
    .select('id, requester_id, recipient_id, status, created_at')
    .limit(3500);

  if (connections) {
    const totalConnections = connections.length;
    const statusCounts = {};
    connections.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    const uniqueUsersConnected = new Set([...connections.map(c => c.requester_id), ...connections.map(c => c.recipient_id)]).size;
    report.connectionsAudit = {
      totalConnections,
      statusCounts,
      uniqueUsersConnected
    };
  }

  // 6. User Referrals Deep Dive
  const { data: referrals, error: refErr } = await supabase
    .from('user_referrals')
    .select('*')
    .limit(100);

  report.referralsAudit = {
    records: referrals || [],
    error: refErr ? refErr.message : null
  };

  fs.writeFileSync('reports/forensic_baseline_data.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('✅ Forensic baseline data successfully generated in reports/forensic_baseline_data.json');
}

runForensicAudit().catch(console.error);
