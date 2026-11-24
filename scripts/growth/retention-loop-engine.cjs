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

async function runRetentionLoopEngine(dryRun = false) {
  console.log(`=== RUNNING RETENTION LOOP ENGINE (dryRun=${dryRun}) ===`);

  // 1. Fetch Users who haven't logged in recently (or haven't received digest in 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidateUsers, error: userErr } = await supabase
    .from('profiles')
    .select('id, full_name, headline, location, industry, skills, last_seen')
    .limit(50);

  // 2. Fetch recent notifications to check cooldown
  const { data: recentNotifs } = await supabase
    .from('notifications')
    .select('user_id, created_at, type')
    .eq('type', 'retention_digest')
    .gte('created_at', sevenDaysAgo);

  const usersInCooldown = new Set((recentNotifs || []).map(n => n.user_id));

  // 3. Fetch real jobs for matching
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20);

  // 4. Fetch real recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, content, likes_count')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  let evaluated = 0;
  let notificationsDispatched = 0;
  const dispatchedList = [];

  for (const user of candidateUsers || []) {
    evaluated++;
    if (usersInCooldown.has(user.id)) {
      continue; // Respect frequency cap: 1 digest per 7 days
    }

    // Match relevant jobs based on location or default to top recent jobs
    let matchedJobs = [];
    if (user.location) {
      matchedJobs = (recentJobs || []).filter(j => 
        (j.location && j.location.toLowerCase().includes(user.location.toLowerCase().split(',')[0].trim())) ||
        (j.location_city && j.location_city.toLowerCase().includes(user.location.toLowerCase().split(',')[0].trim()))
      );
    }
    if (matchedJobs.length === 0) {
      matchedJobs = (recentJobs || []).slice(0, 2);
    }

    const featuredJob = matchedJobs[0];
    const jobCount = matchedJobs.length;

    const notifTitle = `Weekly Career Update: ${jobCount} new opportunities in your domain`;
    const notifMessage = featuredJob 
      ? `Explore new openings including ${featuredJob.title} at ${featuredJob.company_name || 'verified companies'} on TalentXcel.`
      : 'Connect with new professionals and discover active opportunities on TalentXcel.';

    dispatchedList.push({
      user_id: user.id,
      title: notifTitle,
      message: notifMessage,
      link: '/jobs',
      type: 'retention_digest',
      category: 'career_growth',
      priority: 'high',
      relevance_score: 0.950,
      delivery_status: 'delivered',
      is_read: false
    });

    if (dispatchedList.length >= 10) break; // Limit batch size per run
  }

  console.log(`Evaluated ${evaluated} candidate users. Queued ${dispatchedList.length} value-driven retention updates.`);

  if (!dryRun && dispatchedList.length > 0) {
    const { error: insertErr } = await supabase
      .from('notifications')
      .insert(dispatchedList);

    if (insertErr) {
      console.error('Error dispatching retention notifications:', insertErr.message);
    } else {
      console.log(`✓ Successfully dispatched ${dispatchedList.length} retention notifications with 7-day cooldown.`);
      notificationsDispatched = dispatchedList.length;
    }
  }

  const report = {
    executedAt: new Date().toISOString(),
    dryRun,
    usersEvaluated: evaluated,
    cooldownProtectedUsers: usersInCooldown.size,
    notificationsDispatched,
    samplePayload: dispatchedList[0] || null
  };

  fs.writeFileSync('reports/retention_engine_report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('✅ Retention engine report saved to reports/retention_engine_report.json');
}

runRetentionLoopEngine(false).catch(console.error);
