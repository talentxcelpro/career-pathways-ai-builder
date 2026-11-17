const { runSql } = require('./db-audit-helper.cjs');

console.log('====================================================');
console.log('TALENTXCEL AUTONOMOUS DISTRIBUTION OS — END-TO-END VERIFICATION');
console.log('====================================================\n');

const slots = [
  { slot: '08:00_IST', cat: 'tech_high_growth', label: 'Morning Tech & High-Growth' },
  { slot: '12:00_IST', cat: 'fresher_entry', label: 'Midday Fresher & Entry-Level' },
  { slot: '16:00_IST', cat: 'city_spotlight', label: 'Afternoon City Spotlight' },
  { slot: '20:00_IST', cat: 'remote_executive', label: 'Evening Remote & Leadership' }
];

let allPassed = true;

for (const s of slots) {
  console.log(`[SLOT: ${s.slot}] Testing Category: ${s.cat} (${s.label})`);
  const query = `SELECT id, job_title, company_name, location_city, salary_range, salary_min, salary_max, external_url, seo_slug, is_remote, match_score FROM get_distribution_eligible_jobs('${s.cat}'::text, 4, '{}'::uuid[]);`;
  const jobs = runSql(query, 'production');

  if (!Array.isArray(jobs) || jobs.length === 0) {
    console.error(`  ❌ Failed: No jobs returned for ${s.cat}`);
    allPassed = false;
    continue;
  }

  console.log(`  ✅ Retrieved ${jobs.length} eligible jobs (Top Score: ${jobs[0].match_score})`);
  
  // Verify mandatory fields
  for (const j of jobs) {
    if (!j.job_title || j.job_title.trim().length === 0) {
      console.error(`  ❌ Invariant Violation: Blank job title on job ${j.id}`);
      allPassed = false;
    }
    if (!j.company_name || j.company_name.trim().length === 0) {
      console.error(`  ❌ Invariant Violation: Blank company on job ${j.id}`);
      allPassed = false;
    }
  }

  // Sample post output verification
  const sampleJob = jobs[0];
  console.log(`  🔍 Sample featured role: "${sampleJob.job_title}" at ${sampleJob.company_name}`);
  console.log(`     Location: ${sampleJob.location_city || 'PAN-India'} | Salary: ${sampleJob.salary_range || 'Disclosed on apply'}`);
  console.log(`     Apply Destination: ${sampleJob.external_url || `https://talentxcel.in/jobs/${sampleJob.seo_slug || sampleJob.id}`}`);
  console.log('');
}

console.log('====================================================');
if (allPassed) {
  console.log('🎉 ALL DISTRIBUTION CATEGORIES & INVARIANTS VERIFIED SUCCESSFULLY!');
} else {
  console.error('⚠️ SOME DISTRIBUTION INVARIANTS FAILED');
  process.exit(1);
}
console.log('====================================================');
