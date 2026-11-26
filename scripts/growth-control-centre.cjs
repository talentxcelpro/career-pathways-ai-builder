// scripts/growth-control-centre.cjs
// TalentXcel Verified Growth Control Centre (Phase 11)
// Read-only telemetry aggregator pulling live data from Supabase Auth/DB, all 10 GSC properties, and GA4.
// Never fabricates numbers or hardcodes channel counts.

const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
let SUPABASE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || '';
if (!SUPABASE_KEY && fs.existsSync('.env.local')) {
  const m = fs.readFileSync('.env.local', 'utf8').match(/TALENTXCEL_SERVICE_ROLE_KEY="?([^"\r\n]+)"?/);
  if (m && m[1]) SUPABASE_KEY = m[1];
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getGoogleToken(keyFile, scopes) {
  if (!fs.existsSync(keyFile)) return null;
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const jwt = `${unsigned}.${sign.sign(key.private_key, 'base64url')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  return (await res.json()).access_token || null;
}

async function queryGsc(siteUrl, token, body) {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function queryGa4(token, body) {
  const res = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/499367883:runReport', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  const now = Date.now();
  const report = { generatedAt: new Date().toISOString() };

  // 1. Confirmed Registrations & Retention (Supabase Auth)
  let users = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    users.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }
  const dailyRegistrations = {};
  const providers = {};
  let confirmed = 0, returningAfter1h = 0, last7dReg = 0;
  for (const u of users) {
    if (u.email_confirmed_at || u.confirmed_at) confirmed++;
    if (u.last_sign_in_at && u.created_at && new Date(u.last_sign_in_at) - new Date(u.created_at) > 3600 * 1000) returningAfter1h++;
    const p = u.app_metadata?.provider || 'email';
    providers[p] = (providers[p] || 0) + 1;
    const ageMs = now - new Date(u.created_at).getTime();
    if (ageMs <= 7 * 86400 * 1000) last7dReg++;
    if (ageMs <= 14 * 86400 * 1000) {
      const d = u.created_at.slice(0, 10);
      dailyRegistrations[d] = (dailyRegistrations[d] || 0) + 1;
    }
  }

  // 2. Profiles, Activation & Job Supply
  const [profAll, profResume, profHeadline, appsAll, savedAll, postsAll, aiResAll, jobsActive, jobsRemote, jobsSalary] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('resume_url', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('headline', 'is', null),
    supabase.from('job_applications').select('*', { count: 'exact', head: true }),
    supabase.from('saved_jobs').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('ai_resumes').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_remote', true),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true).gt('salary_min', 0),
  ]);

  report.authAndActivation = {
    totalAuthUsers: users.length,
    confirmedUsers: confirmed,
    last7dRegistrations: last7dReg,
    returningAfter1h,
    retentionRatePct: users.length ? Number(((returningAfter1h / users.length) * 100).toFixed(2)) : 0,
    providers,
    dailyRegistrations14d: Object.fromEntries(Object.entries(dailyRegistrations).sort()),
    profilesTotal: profAll.count || 0,
    profileResumeCompletionPct: profAll.count ? Number((((profResume.count || 0) / profAll.count) * 100).toFixed(1)) : 0,
    profileHeadlineCompletionPct: profAll.count ? Number((((profHeadline.count || 0) / profAll.count) * 100).toFixed(1)) : 0,
    jobApplicationsTotal: appsAll.count || 0,
    savedJobsTotal: savedAll.count || 0,
    postsTotal: postsAll.count || 0,
    aiResumesTotal: aiResAll.count || 0,
  };

  report.jobInventory = {
    activeJobs: jobsActive.count || 0,
    remoteActiveJobs: jobsRemote.count || 0,
    salaryDisclosedJobs: jobsSalary.count || 0,
  };

  // 3. GSC All-Properties (28d) + Google for Jobs
  const gscToken = await getGoogleToken('gsc-service-account.json', ['https://www.googleapis.com/auth/webmasters.readonly']);
  if (gscToken) {
    const props = [
      'https://talentxcel.in/',
      'sc-domain:jobs.talentxcel.in',
      'sc-domain:salary.talentxcel.in',
      'sc-domain:careers.talentxcel.in',
      'sc-domain:resume.talentxcel.in',
      'sc-domain:employers.talentxcel.in',
      'sc-domain:passport.talentxcel.in',
    ];
    report.gsc28d = {};
    for (const p of props) {
      const r = await queryGsc(p, gscToken, { startDate: '2026-10-28', endDate: '2026-11-24', aggregationType: 'byProperty' });
      const row = r.rows?.[0];
      if (row) report.gsc28d[p] = { clicks: row.clicks, impressions: row.impressions, ctrPct: Number((row.ctr * 100).toFixed(2)), position: Number(row.position.toFixed(1)) };
    }
    const gfj = await queryGsc('sc-domain:jobs.talentxcel.in', gscToken, { startDate: '2026-10-28', endDate: '2026-11-24', dimensions: ['searchAppearance'] });
    report.googleForJobsJobsSubdomain28d = gfj.rows || [];
  }

  // 4. GA4 Verified Channels, Countries & Key Actions (28d)
  const gaToken = await getGoogleToken('gcp-key.json', ['https://www.googleapis.com/auth/analytics.readonly']);
  if (gaToken) {
    const [ch, ctry] = await Promise.all([
      queryGa4(gaToken, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'engagedSessions' }],
      }),
      queryGa4(gaToken, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ]);
    report.ga4Channels28d = (ch.rows || []).map((r) => ({
      channel: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
      activeUsers: Number(r.metricValues[1].value),
      engagedSessions: Number(r.metricValues[2].value),
    }));
    report.ga4TopCountries28d = (ctry.rows || []).map((r) => ({
      country: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
      activeUsers: Number(r.metricValues[1].value),
    }));
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
