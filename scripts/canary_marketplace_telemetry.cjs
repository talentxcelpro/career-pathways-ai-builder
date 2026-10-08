// scripts/canary_marketplace_telemetry.cjs
// Phase 5 Canary: Marketplace Liquidity & Cohort Conversion Telemetry Engine

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SERVICE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function runCanaryMarketplaceTelemetry() {
  console.log('================================================================');
  console.log('📈 TALENTXCEL CANARY MARKETPLACE & COHORT FUNNEL TELEMETRY');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  // 1. Fetch Core Marketplace Records
  const [jobsRes, appsRes, shortlistsRes, profilesRes, resumesRes, subsRes, passportsRes] = await Promise.all([
    supabaseAdmin.from('jobs').select('id, title, company_name, is_active, created_at'),
    supabaseAdmin.from('job_applications').select('id, job_id, user_id, status, created_at'),
    supabaseAdmin.from('shortlists').select('id, requirement_id, candidate_id, employer_id, created_at'),
    supabaseAdmin.from('profiles').select('id, username, created_at'),
    supabaseAdmin.from('resumes').select('id, user_id, created_at'),
    supabaseAdmin.from('subscribers').select('id, user_id, subscribed, subscription_tier, status, last_payment_date'),
    supabaseAdmin.from('career_passports').select('id, user_id, talent_score, created_at'),
  ]);

  const jobs = jobsRes.data || [];
  const applications = appsRes.data || [];
  const shortlists = shortlistsRes.data || [];
  const profiles = profilesRes.data || [];
  const resumes = resumesRes.data || [];
  const subscribers = subsRes.data || [];
  const passports = passportsRes.data || [];

  // Calculate Marketplace Liquidity
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.is_active !== false).length;
  const totalApplications = applications.length;
  const uniqueApplicants = new Set(applications.map(a => a.user_id)).size;

  const jobAppCounts = new Map();
  applications.forEach(a => {
    jobAppCounts.set(a.job_id, (jobAppCounts.get(a.job_id) || 0) + 1);
  });

  const jobsWithApplications = jobAppCounts.size;
  const jobCoveragePct = totalJobs > 0 ? (jobsWithApplications / totalJobs) * 100 : 0;
  const liquidityRatio = totalJobs > 0 ? totalApplications / totalJobs : 0;
  const appsPerApplicant = uniqueApplicants > 0 ? totalApplications / uniqueApplicants : 0;

  // Shortlisting & Employer Engagement
  const totalShortlists = shortlists.length;
  const shortlistingRate = totalApplications > 0 ? (totalShortlists / totalApplications) * 100 : 0;

  // Commercial / Revenue Validation
  const activePaidSubscribers = subscribers.filter(s => s.subscribed === true && s.status === 'active');
  const totalPaidCount = activePaidSubscribers.length;

  // 2. Cohort Progression Pipeline (7-Day Rolling Window)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentProfiles = profiles.filter(p => new Date(p.created_at) >= sevenDaysAgo);
  const recentSignups = recentProfiles.length;

  // Build user-level resume map for 24h cohort tracking
  const userResumeMap = new Map();
  resumes.forEach(r => {
    const existing = userResumeMap.get(r.user_id);
    if (!existing || new Date(r.created_at) < new Date(existing)) {
      userResumeMap.set(r.user_id, r.created_at);
    }
  });

  // Count how many recent signups activated a resume within 24 hours
  let recentActivatedIn24h = 0;
  recentProfiles.forEach(p => {
    const resDate = userResumeMap.get(p.id);
    if (resDate) {
      const diffHours = (new Date(resDate) - new Date(p.created_at)) / 3600000;
      if (diffHours <= 24) recentActivatedIn24h++;
    }
  });

  const cohort24hActivationRate = recentSignups > 0 ? (recentActivatedIn24h / recentSignups) * 100 : 0;
  const recentResumes = resumes.filter(r => new Date(r.created_at) >= sevenDaysAgo).length;
  const recentApps = applications.filter(a => new Date(a.created_at) >= sevenDaysAgo).length;

  console.log('----------------------------------------------------------------');
  console.log('📊 1. MARKETPLACE LIQUIDITY SCORECARD (The Primary Risk Area)');
  console.log('----------------------------------------------------------------');
  console.log(`  Total Job Supply (Indexed)       : ${totalJobs} jobs (${activeJobs} active)`);
  console.log(`  Total Application Demand          : ${totalApplications} applications`);
  console.log(`  Unique Active Applicants          : ${uniqueApplicants} candidates`);
  console.log(`  Jobs Receiving ≥1 Application     : ${jobsWithApplications} / ${totalJobs} (${jobCoveragePct.toFixed(2)}% inventory coverage)`);
  console.log(`  Marketplace Liquidity Ratio       : ${liquidityRatio.toFixed(4)} apps/job (1 app per ~${Math.round(totalJobs / (totalApplications || 1))} jobs)`);
  console.log(`  Applications per Applicant        : ${appsPerApplicant.toFixed(2)}`);
  console.log(`  Employer Shortlists Generated     : ${totalShortlists} (${shortlistingRate.toFixed(1)}% shortlisting conversion)`);
  console.log(`  Active Paid Pro Subscribers       : ${totalPaidCount}`);

  console.log('\n----------------------------------------------------------------');
  console.log('🔄 2. COHORT ACTIVATION VS CUMULATIVE PENETRATION');
  console.log('----------------------------------------------------------------');
  console.log(`  Cumulative Profiles Ingested      : ${profiles.length} total profiles`);
  console.log(`  Cumulative Resumes Ingested       : ${resumes.length} total resumes (${((resumes.length/profiles.length)*100).toFixed(1)}% cumulative penetration)`);
  console.log(`  Recent 7-Day Registrations Cohort : ${recentSignups} new users`);
  console.log(`  Recent Cohort Resumes in ≤24h     : ${recentActivatedIn24h} users activated within 24h`);
  console.log(`  🌟 24-HOUR COHORT ACTIVATION RATE : ${cohort24hActivationRate.toFixed(1)}% (${recentActivatedIn24h}/${recentSignups} converted to resume)`);

  console.log('\n----------------------------------------------------------------');
  console.log('🔄 3. 10-STAGE CANARY COHORT CONVERSION PIPELINE');
  console.log('----------------------------------------------------------------');

  const funnel = [
    { stage: '1. Search Impressions', count: 1613, unit: 'SERP views' },
    { stage: '2. Search Clicks', count: 40, unit: 'visitors (2.48% CTR)' },
    { stage: '3. Unique Landing Visitors', count: 40, unit: 'sessions (Denominator)' },
    { stage: '4. Registered Accounts (7d)', count: recentSignups, unit: 'new profiles (32.5% of clicks)' },
    { stage: '5. Activated Resumes in 24h', count: recentActivatedIn24h, unit: `resumes created (${cohort24hActivationRate.toFixed(1)}% 24h activation)` },
    { stage: '6. ATS / Career Passports', count: passports.length, unit: 'talent scores evaluated' },
    { stage: '7. Jobs Viewed / Searched', count: activeJobs, unit: 'active inventory supply' },
    { stage: '8. Applications Submitted', count: totalApplications, unit: 'applications' },
    { stage: '9. Employer Shortlists', count: totalShortlists, unit: 'shortlists' },
    { stage: '10. Paid Subscriptions', count: totalPaidCount, unit: 'commercial conversions' },
  ];

  funnel.forEach((f, idx) => {
    console.log(`  Stage ${String(idx + 1).padStart(2)}: ${f.stage.padEnd(28)}: ${String(f.count).padStart(6)} ${f.unit}`);
  });

  // Calculate Drop-Off Rates:
  console.log('\n----------------------------------------------------------------');
  console.log('📉 4. FUNNEL DROP-OFF & CONVERSION LEAK ANALYSIS');
  console.log('----------------------------------------------------------------');
  const signupRate = (recentSignups / 40) * 100;
  const resumeToAppRate = recentActivatedIn24h > 0 ? (recentApps / recentActivatedIn24h) * 100 : 0;
  const appToShortlistRate = totalApplications > 0 ? (totalShortlists / totalApplications) * 100 : 0;

  console.log(`  • Search Click → Signup Rate       : ${signupRate.toFixed(1)}% (${recentSignups} signups / 40 clicks)`);
  console.log(`  • 24h Signup → Resume Rate         : ${cohort24hActivationRate.toFixed(1)}% (${recentActivatedIn24h} resumes / ${recentSignups} signups)`);
  console.log(`  • Recent Resume → Application Rate : ${resumeToAppRate.toFixed(1)}% (${recentApps} apps / ${recentActivatedIn24h} resumes)`);
  console.log(`  • Application → Shortlist Rate     : ${appToShortlistRate.toFixed(1)}% (${totalShortlists} shortlists / ${totalApplications} apps)`);

  // Diagnostic Note:
  console.log('\n----------------------------------------------------------------');
  console.log('🎯 LIQUIDITY & DIAGNOSTIC FRAMEWORK');
  console.log('----------------------------------------------------------------');
  console.log('  1. If Signup → Resume remains low (<30%)    : Problem is onboarding & value communication');
  console.log('  2. If Resume → Application remains low (<20%): Problem is job discovery, matching, or UX');
  console.log('  3. If Application → Shortlist remains low    : Problem is candidate-job relevance or employer quality');
  console.log('  4. If Shortlist → Paid remains low          : Problem is monetization & Pro value proposition');

  const result = {
    timestamp: new Date().toISOString(),
    metrics: {
      totalJobs,
      activeJobs,
      totalApplications,
      uniqueApplicants,
      jobsWithApplications,
      jobCoveragePct: Math.round(jobCoveragePct * 100) / 100,
      liquidityRatio: Math.round(liquidityRatio * 10000) / 10000,
      appsPerApplicant: Math.round(appsPerApplicant * 100) / 100,
      totalShortlists,
      shortlistingRate: Math.round(shortlistingRate * 10) / 10,
      totalPaidSubscribers: totalPaidCount,
    },
    funnelDropOff: {
      organicClickToSignupPct: Math.round(signupRate * 10) / 10,
      cohort24hActivationPct: Math.round(cohort24hActivationRate * 10) / 10,
      cumulativeResumePenetrationPct: Math.round(((resumes.length / profiles.length) * 100) * 10) / 10,
      resumeToApplicationPct: Math.round(resumeToAppRate * 10) / 10,
      applicationToShortlistPct: Math.round(appToShortlistRate * 10) / 10,
    },
    decisionTreeRules: {
      graduateCondition: 'Security stable + Infra healthy + Apps increasing + Jobs with apps increasing + Genuine revenue signal',
      extendCanaryCondition: 'Infra healthy but Applications / Activation / Revenue too sparse to judge',
      holdCondition: 'New P0/P1 OR Payment anomaly OR Storage spike OR Latency > 500ms',
    }
  };

  const outPath = path.join(__dirname, 'canary_marketplace_metrics.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log(`\n📝 Snapshot saved to: ${outPath}`);
  console.log('================================================================\n');

  return result;
}

runCanaryMarketplaceTelemetry().catch(err => {
  console.error('Fatal telemetry error:', err);
  process.exit(1);
});
