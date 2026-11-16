const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');
let key = '', url = '';
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const l of lines) {
    const trimmed = l.trim();
    if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) key = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
    if (trimmed.startsWith('TX_SUPABASE_URL=')) url = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  }
}

const s = createClient(url || 'https://dthlgsnakhoftinssokm.supabase.co', key);

async function runAudit() {
  console.log('====================================================');
  console.log('TALENTXCEL PRODUCTION FORENSIC AUDIT — PHASE ZERO');
  console.log('Database Ref: dthlgsnakhoftinssokm');
  console.log('Timestamp:', new Date().toISOString());
  console.log('====================================================\n');

  // 1. Schema check on related tables
  const tables = [
    'jobs', 'companies', 'job_categories', 'canonical_cities',
    'canonical_roles', 'external_ats_sources', 'indexing_outbox',
    'job_alert_campaigns', 'job_alert_campaign_jobs', 'job_alert_preferences',
    'notifications', 'notification_outbox', 'email_automation_queue'
  ];

  console.log('--- 1. RELATED TABLES EXISTENCE & ROW COUNTS ---');
  for (const t of tables) {
    const { count, error } = await s.from(t).select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${t.padEnd(26)}: [NOT FOUND / ERROR] ${error.message}`);
    } else {
      console.log(`Table ${t.padEnd(26)}: [EXISTS] Count = ${count}`);
    }
  }

  // 2. Total Jobs Breakdown
  console.log('\n--- 2. OVERALL JOBS INVENTORY METRICS ---');
  const { count: totalJobs } = await s.from('jobs').select('id', { count: 'exact', head: true });
  const { count: activeJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true);
  const { count: inactiveJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', false);
  const { count: openStatusJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('job_status', 'open');
  const { count: closedStatusJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).neq('job_status', 'open');

  console.log('Total Jobs in Database        :', totalJobs);
  console.log('Active Jobs (is_active=true)  :', activeJobs);
  console.log('Inactive Jobs (is_active=false):', inactiveJobs);
  console.log('Open Status (job_status=open) :', openStatusJobs);
  console.log('Non-Open Status               :', closedStatusJobs);

  // 3. Timestamps & Ingestion Freshness
  console.log('\n--- 3. INGESTION RECENCY & TIMESTAMPS ---');
  const now = new Date();
  const t24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const t7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const t30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { count: last24h } = await s.from('jobs').select('id', { count: 'exact', head: true }).gte('created_at', t24h);
  const { count: last7d } = await s.from('jobs').select('id', { count: 'exact', head: true }).gte('created_at', t7d);
  const { count: last30d } = await s.from('jobs').select('id', { count: 'exact', head: true }).gte('created_at', t30d);
  const { count: olderThan30d } = await s.from('jobs').select('id', { count: 'exact', head: true }).lt('created_at', t30d);

  console.log('Jobs created in last 24 hours :', last24h);
  console.log('Jobs created in last 7 days   :', last7d);
  console.log('Jobs created in last 30 days  :', last30d);
  console.log('Jobs older than 30 days       :', olderThan30d);

  // 4. Expiry Audit
  console.log('\n--- 4. EXPIRY & DEADLINE AUDIT ---');
  const nowIso = now.toISOString();
  const in7daysIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count: expiredActive } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).not('expires_at', 'is', null).lte('expires_at', nowIso);
  const { count: expiringSoonActive } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).not('expires_at', 'is', null).gt('expires_at', nowIso).lte('expires_at', in7daysIso);
  const { count: futureUnexpiredActive } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).gt('expires_at', in7daysIso);
  const { count: nullExpiryActive } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).is('expires_at', null);

  console.log('Active jobs already expired (expires_at <= now)      :', expiredActive);
  console.log('Active jobs expiring in 7 days (now < exp <= 7d)     :', expiringSoonActive);
  console.log('Active jobs with healthy expiry (> 7 days)           :', futureUnexpiredActive);
  console.log('Active jobs with NULL expiry                         :', nullExpiryActive);

  // 5. Application URLs Audit
  console.log('\n--- 5. APPLICATION DESTINATIONS (APPLY URLS) ---');
  const { count: hasExternalUrl } = await s.from('jobs').select('id', { count: 'exact', head: true }).not('external_url', 'is', null).neq('external_url', '');
  const { count: hasSeoSlug } = await s.from('jobs').select('id', { count: 'exact', head: true }).not('seo_slug', 'is', null).neq('seo_slug', '');
  console.log('Jobs with non-empty external_url :', hasExternalUrl);
  console.log('Jobs with valid seo_slug         :', hasSeoSlug);

  // 6. Employer & Salary Audit
  console.log('\n--- 6. EMPLOYER & SALARY DATA COMPLETENESS ---');
  const { count: missingCompany } = await s.from('jobs').select('id', { count: 'exact', head: true }).is('company_name', null);
  const { count: hasSalaryMin } = await s.from('jobs').select('id', { count: 'exact', head: true }).not('salary_min', 'is', null).gt('salary_min', 0);
  const { count: hasSalaryRange } = await s.from('jobs').select('id', { count: 'exact', head: true }).not('salary_min', 'is', null).not('salary_max', 'is', null).gt('salary_min', 0);
  const { count: missingSalary } = await s.from('jobs').select('id', { count: 'exact', head: true }).is('salary_min', null);

  console.log('Jobs missing company_name        :', missingCompany);
  console.log('Jobs with salary_min > 0         :', hasSalaryMin);
  console.log('Jobs with both min & max salary  :', hasSalaryRange);
  console.log('Jobs with completely null salary :', missingSalary);

  // 7. Remote, Fresher & Experience
  console.log('\n--- 7. WORKPLACE TYPE & EXPERIENCE CLASSIFICATION ---');
  const { count: remoteJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_remote', true);
  const { count: fresherLevelJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).or('experience_level.ilike.%fresher%,experience_level.ilike.%entry%,title.ilike.%trainee%,title.ilike.%fresher%,title.ilike.%graduate%');
  const { count: internJobs } = await s.from('jobs').select('id', { count: 'exact', head: true }).or('employment_type.ilike.%intern%,title.ilike.%intern%');

  console.log('Remote Jobs (is_remote=true)     :', remoteJobs);
  console.log('Fresher / Entry / Trainee Jobs   :', fresherLevelJobs);
  console.log('Internships                      :', internJobs);

  // 8. Fetch detailed sample for State, City, Category, IT vs Non-IT distribution
  console.log('\n--- 8. GEOGRAPHIC & TAXONOMY DISTRIBUTIONS (FETCHING ALL ACTIVE JOBS) ---');
  const allActiveJobs = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await s
      .from('jobs')
      .select('id, title, company_name, location, location_city, location_state, is_remote, salary_min, salary_max, salary_currency, created_at, seo_slug, external_url, is_active, job_status, expires_at, source')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      console.error('Error fetching page', page, error);
      break;
    }
    if (!data || data.length === 0) break;
    allActiveJobs.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Successfully fetched ${allActiveJobs.length} active job records for comprehensive in-memory analysis.`);

  // City distribution
  const cityCounts = {};
  const stateCounts = {};
  const sourceCounts = {};
  let itCount = 0;
  let nonItCount = 0;
  let govtCount = 0;

  const IT_KEYWORDS = ['software', 'engineer', 'developer', 'frontend', 'backend', 'full stack', 'qa', 'test', 'data', 'ai', 'cloud', 'devops', 'tech', 'python', 'react', 'java', 'architect', 'analyst'];
  const GOVT_KEYWORDS = ['ntpc', 'bhel', 'ongc', 'sail', 'isro', 'drdo', 'psu', 'government', 'sarkari', 'railway', 'upsc', 'ssc'];

  const duplicateMap = new Map();
  let duplicateCount = 0;

  for (const j of allActiveJobs) {
    // City
    const city = (j.location_city || (j.location ? j.location.split(',')[0] : '') || 'Unspecified').trim();
    cityCounts[city] = (cityCounts[city] || 0) + 1;

    // State
    const state = (j.location_state || (j.location && j.location.split(',').length > 1 ? j.location.split(',')[1] : '') || 'Unspecified').trim();
    stateCounts[state] = (stateCounts[state] || 0) + 1;

    // Source
    const src = j.source || 'Direct/Unknown';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;

    // IT vs Non-IT
    const titleLower = (j.title || '').toLowerCase();
    const isIT = IT_KEYWORDS.some(k => titleLower.includes(k));
    if (isIT) itCount++; else nonItCount++;

    // Govt
    const isGovt = GOVT_KEYWORDS.some(k => titleLower.includes(k) || (j.company_name || '').toLowerCase().includes(k));
    if (isGovt) govtCount++;

    // Duplicate check: title + company + city
    const dupKey = `${titleLower}|${(j.company_name || '').toLowerCase()}|${city.toLowerCase()}`;
    if (duplicateMap.has(dupKey)) {
      duplicateCount++;
      duplicateMap.set(dupKey, duplicateMap.get(dupKey) + 1);
    } else {
      duplicateMap.set(dupKey, 1);
    }
  }

  console.log('\nTop 15 Cities:');
  const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
  sortedCities.slice(0, 15).forEach(([c, cnt]) => console.log(`  - ${c.padEnd(25)}: ${cnt} jobs`));

  console.log('\nTop 10 States/Regions:');
  const sortedStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
  sortedStates.slice(0, 10).forEach(([st, cnt]) => console.log(`  - ${st.padEnd(25)}: ${cnt} jobs`));

  console.log('\nJob Sources:');
  Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).forEach(([src, cnt]) => console.log(`  - ${src.padEnd(25)}: ${cnt} jobs`));

  console.log('\nTaxonomy Breakdown:');
  console.log('  - IT & Tech Jobs          :', itCount, `(${((itCount / allActiveJobs.length) * 100).toFixed(1)}%)`);
  console.log('  - Non-IT / Business Roles :', nonItCount, `(${((nonItCount / allActiveJobs.length) * 100).toFixed(1)}%)`);
  console.log('  - Government / PSU Openings:', govtCount);
  console.log('  - Duplicate Jobs Detected  :', duplicateCount);

  // 9. Jobs Ready for Immediate Telegram & WhatsApp Publication
  const readyJobs = allActiveJobs.filter(j => {
    const hasTitle = Boolean(j.title && j.title.trim().length > 3);
    const hasCompany = Boolean(j.company_name && j.company_name.trim().length > 1);
    const hasLocation = Boolean((j.location_city || j.location) && (j.location_city || j.location).trim().length > 1);
    const hasSlugOrId = Boolean(j.seo_slug || j.id);
    const notExpired = !j.expires_at || new Date(j.expires_at).getTime() > Date.now();
    return hasTitle && hasCompany && hasLocation && hasSlugOrId && notExpired;
  });

  console.log('\n--- 9. JOBS READY FOR IMMEDIATE DISTRIBUTION ---');
  console.log('Total Active Jobs Passing Quality Gate:', readyJobs.length);
  console.log('Percentage Quality Compliance        :', `${((readyJobs.length / allActiveJobs.length) * 100).toFixed(2)}%`);

  // Write audit JSON for reporting
  const auditReport = {
    timestamp: new Date().toISOString(),
    databaseRef: 'dthlgsnakhoftinssokm',
    totalJobs,
    activeJobs,
    inactiveJobs,
    openStatusJobs,
    closedStatusJobs,
    last24h,
    last7d,
    last30d,
    olderThan30d,
    expiredActive,
    expiringSoonActive,
    futureUnexpiredActive,
    nullExpiryActive,
    hasExternalUrl,
    hasSeoSlug,
    missingCompany,
    hasSalaryMin,
    hasSalaryRange,
    missingSalary,
    remoteJobs,
    fresherLevelJobs,
    internJobs,
    itCount,
    nonItCount,
    govtCount,
    duplicateCount,
    readyJobsCount: readyJobs.length,
    topCities: sortedCities.slice(0, 25),
    topStates: sortedStates.slice(0, 15),
    sources: sourceCounts
  };

  fs.writeFileSync('production_job_inventory_audit.json', JSON.stringify(auditReport, null, 2), 'utf-8');
  console.log('\nAudit complete. Saved full audit data to production_job_inventory_audit.json');
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
