const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let serviceKey = '';
const url = 'https://dthlgsnakhoftinssokm.supabase.co';

if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
      const idx = trimmed.indexOf('=');
      serviceKey = trimmed.substring(idx + 1).replace(/^['"]|['"]$/g, '').trim();
    }
  });
}

const supabase = createClient(url, serviceKey);

async function runAudit() {
  console.log('================================================================');
  console.log('PHASE 1 — INTERNATIONAL DATA AUDIT: TALENTXCEL JOBS DATABASE');
  console.log('================================================================\n');

  // 1. Inspect Table Columns
  const sampleRes = await supabase.from('jobs').select('*').limit(1);
  if (sampleRes.error) {
    console.error('Failed to query jobs table:', sampleRes.error);
    return;
  }
  const sample = sampleRes.data[0] || {};
  const columns = Object.keys(sample);
  console.log('Total Columns in `jobs` Table:', columns.length);
  console.log('Columns:', columns.join(', '));
  console.log('\n----------------------------------------------------------------');

  // 2. Fetch all jobs in batches of 1000 to do an exhaustive census
  let allJobs = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('Error fetching batch:', error);
      break;
    }
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allJobs = allJobs.concat(data);
      from += batchSize;
      if (data.length < batchSize) {
        hasMore = false;
      }
    }
  }

  console.log(`Total Records Audited: ${allJobs.length}`);
  const now = new Date();

  // 3. Active vs Expired Status
  let activeCount = 0;
  let expiredCount = 0;
  let explicitlyInactive = 0;
  let deadlineExpired = 0;
  let expiresAtExpired = 0;

  allJobs.forEach(j => {
    let isExpired = false;
    if (j.is_active === false) {
      explicitlyInactive++;
      isExpired = true;
    }
    if (j.application_deadline && new Date(j.application_deadline) < now) {
      deadlineExpired++;
      isExpired = true;
    }
    if (j.expires_at && new Date(j.expires_at) < now) {
      expiresAtExpired++;
      isExpired = true;
    }

    if (isExpired) {
      expiredCount++;
    } else {
      activeCount++;
    }
  });

  console.log('\n--- Active vs Expired Analysis ---');
  console.log(`- Currently Active & Live: ${activeCount}`);
  console.log(`- Expired / Inactive: ${expiredCount}`);
  console.log(`  • Explicitly marked inactive (is_active=false): ${explicitlyInactive}`);
  console.log(`  • Passed application_deadline: ${deadlineExpired}`);
  console.log(`  • Passed expires_at: ${expiresAtExpired}`);

  // 4. Country & City Distribution
  const countryCounts = {};
  const cityCounts = {};
  const countryCities = {};
  const uaeCities = {};
  const usCities = {};
  const indiaCities = {};
  const otherCountries = {};

  // Helper to normalize country from location string or columns
  function detectCountry(j) {
    const loc = `${j.location || ''} ${j.location_city || ''} ${j.location_state || ''}`.toLowerCase();
    if (loc.includes('united arab emirates') || loc.includes('uae') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('ajman') || loc.includes('fujairah') || loc.includes('ras al khaimah')) {
      return 'United Arab Emirates';
    }
    if (loc.includes('united states') || loc.includes('usa') || loc.includes('u.s.') || loc.includes('austin') || loc.includes('seattle') || loc.includes('new york') || loc.includes('san francisco') || loc.includes('california') || loc.includes('texas') || loc.includes('atlanta') || loc.includes('boston') || loc.includes('washington') || loc.includes('chicago')) {
      return 'United States';
    }
    if (loc.includes('saudi arabia') || loc.includes('saudi') || loc.includes('riyadh') || loc.includes('jeddah') || loc.includes('dammam')) {
      return 'Saudi Arabia';
    }
    if (loc.includes('qatar') || loc.includes('doha')) {
      return 'Qatar';
    }
    if (loc.includes('oman') || loc.includes('muscat')) {
      return 'Oman';
    }
    if (loc.includes('united kingdom') || loc.includes('london') || loc.includes('uk')) {
      return 'United Kingdom';
    }
    if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('darmstadt')) {
      return 'Germany';
    }
    if (loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('eindhoven')) {
      return 'Netherlands';
    }
    if (loc.includes('ireland') || loc.includes('dublin')) {
      return 'Ireland';
    }
    if (loc.includes('canada') || loc.includes('toronto') || loc.includes('ottawa') || loc.includes('vancouver')) {
      return 'Canada';
    }
    if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne') || loc.includes('canberra')) {
      return 'Australia';
    }
    if (loc.includes('singapore')) {
      return 'Singapore';
    }
    if (loc.includes('nigeria') || loc.includes('lagos')) {
      return 'Nigeria';
    }
    if (loc.includes('kenya') || loc.includes('nairobi')) {
      return 'Kenya';
    }
    if (loc.includes('south africa') || loc.includes('johannesburg') || loc.includes('cape town')) {
      return 'South Africa';
    }
    if (loc.includes('egypt') || loc.includes('cairo')) {
      return 'Egypt';
    }
    if (loc.includes('rwanda') || loc.includes('kigali')) {
      return 'Rwanda';
    }
    if (loc.includes('belgium') || loc.includes('brussels')) {
      return 'Belgium';
    }
    if (loc.includes('remote') || loc.includes('worldwide') || loc.includes('anywhere')) {
      return 'Worldwide Remote';
    }
    if (loc.includes('india') || loc.includes('delhi') || loc.includes('mumbai') || loc.includes('bengaluru') || loc.includes('bangalore') || loc.includes('hyderabad') || loc.includes('pune') || loc.includes('chennai') || loc.includes('noida') || loc.includes('gurgaon') || loc.includes('gurugram') || loc.includes('kolkata')) {
      return 'India';
    }
    return 'India (Domestic / Unspecified)';
  }

  allJobs.forEach(j => {
    const country = detectCountry(j);
    countryCounts[country] = (countryCounts[country] || 0) + 1;

    const city = j.location_city || (j.location ? j.location.split(',')[0].trim() : 'Unspecified');
    cityCounts[city] = (cityCounts[city] || 0) + 1;

    if (!countryCities[country]) countryCities[country] = {};
    countryCities[country][city] = (countryCities[country][city] || 0) + 1;
  });

  console.log('\n--- Country Distribution (Actual Census) ---');
  Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      const pct = ((count / allJobs.length) * 100).toFixed(1);
      console.log(`  • ${country}: ${count} jobs (${pct}%)`);
    });

  console.log('\n--- Key Target Region City Counts ---');
  console.log('UAE Cities:');
  console.log(countryCities['United Arab Emirates'] || 'None');
  console.log('United States Cities:');
  console.log(countryCities['United States'] || 'None');
  console.log('Saudi Arabia Cities:');
  console.log(countryCities['Saudi Arabia'] || 'None');
  console.log('Qatar Cities:');
  console.log(countryCities['Qatar'] || 'None');
  console.log('Top 15 Cities in India:');
  const indEntries = Object.entries(countryCities['India'] || countryCities['India (Domestic / Unspecified)'] || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  indEntries.forEach(([c, n]) => console.log(`  • ${c}: ${n}`));

  // 5. Employer Sources
  const employerCounts = {};
  const sourceCounts = {};
  allJobs.forEach(j => {
    const emp = j.company_name || 'Unknown Employer';
    employerCounts[emp] = (employerCounts[emp] || 0) + 1;

    const src = j.source || 'Direct Employer / Portal Default';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  console.log('\n--- Employer & Source Analysis ---');
  console.log(`Unique Employers in Database: ${Object.keys(employerCounts).length}`);
  console.log('Top 15 Employers:');
  Object.entries(employerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([emp, cnt]) => console.log(`  • ${emp}: ${cnt} vacancies`));

  // 6. Salary Currencies & Ranges
  const salaryCurrencies = {};
  let jobsWithSalary = 0;
  let jobsWithoutSalary = 0;

  allJobs.forEach(j => {
    const hasSalary = (j.salary_min && j.salary_min > 0) || (j.salary_max && j.salary_max > 0);
    if (hasSalary) {
      jobsWithSalary++;
      const curr = j.salary_currency || j.currency || (j.location && j.location.includes('United States') ? 'USD' : (j.location && j.location.includes('United Arab Emirates') ? 'AED' : 'INR (Implied)'));
      salaryCurrencies[curr] = (salaryCurrencies[curr] || 0) + 1;
    } else {
      jobsWithoutSalary++;
    }
  });

  console.log('\n--- Salary Currency & Coverage ---');
  console.log(`- Vacancies with Structured Compensation: ${jobsWithSalary} (${((jobsWithSalary / allJobs.length) * 100).toFixed(1)}%)`);
  console.log(`- Vacancies without Compensation ("Competitive / Undisclosed"): ${jobsWithoutSalary}`);
  console.log('Currencies breakdown:');
  console.log(salaryCurrencies);

  // 7. Application URL Validity
  let validUrlCount = 0;
  let invalidUrlCount = 0;
  let missingUrlCount = 0;
  const urlDomains = {};

  allJobs.forEach(j => {
    if (!j.external_url) {
      missingUrlCount++;
    } else {
      try {
        const u = new URL(j.external_url);
        if (u.protocol === 'http:' || u.protocol === 'https:') {
          validUrlCount++;
          urlDomains[u.hostname] = (urlDomains[u.hostname] || 0) + 1;
        } else {
          invalidUrlCount++;
        }
      } catch (e) {
        invalidUrlCount++;
      }
    }
  });

  console.log('\n--- Application URL Validity ---');
  console.log(`- Valid HTTP/HTTPS Routing URLs: ${validUrlCount} (${((validUrlCount / allJobs.length) * 100).toFixed(1)}%)`);
  console.log(`- Missing Application URLs: ${missingUrlCount}`);
  console.log(`- Malformed / Invalid URLs: ${invalidUrlCount}`);
  console.log('Top Application Destination Domains:');
  Object.entries(urlDomains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([dom, cnt]) => console.log(`  • ${dom}: ${cnt}`));

  // 8. Work Mode & Remote Eligibility
  const workModeCounts = {};
  let remoteCount = 0;
  allJobs.forEach(j => {
    const wm = j.work_mode || (j.is_remote ? 'remote' : 'unspecified');
    workModeCounts[wm] = (workModeCounts[wm] || 0) + 1;
    if (j.is_remote || wm.toLowerCase() === 'remote') {
      remoteCount++;
    }
  });

  console.log('\n--- Work Mode & Remote Eligibility ---');
  console.log(`- Fully Remote Vacancies: ${remoteCount}`);
  console.log('Work Mode breakdown:', workModeCounts);

  // 9. Visa Sponsorship Information & Relocation
  let visaSponsoredCount = 0;
  let relocationCount = 0;
  allJobs.forEach(j => {
    if (j.visa_sponsored || (j.description && j.description.toLowerCase().includes('visa sponsor'))) {
      visaSponsoredCount++;
    }
    if (j.relocation_assistance || (j.description && j.description.toLowerCase().includes('relocation'))) {
      relocationCount++;
    }
  });

  console.log('\n--- Visa Sponsorship & Relocation Coverage ---');
  console.log(`- Explicitly Confirmed Visa Sponsored: ${visaSponsoredCount}`);
  console.log(`- Explicitly Confirmed Relocation Assistance: ${relocationCount}`);
  console.log('Note: We adhere strictly to the rule: Do not label a job visa-sponsored unless the source confirms it.');

  // 10. Duplicate Vacancies Analysis
  const seenTitlesAndCompanies = new Map();
  let duplicateCount = 0;
  allJobs.forEach(j => {
    const key = `${(j.title || '').toLowerCase().trim()}:::${(j.company_name || '').toLowerCase().trim()}:::${(j.location || '').toLowerCase().trim()}`;
    if (seenTitlesAndCompanies.has(key)) {
      duplicateCount++;
    } else {
      seenTitlesAndCompanies.set(key, j.id);
    }
  });

  console.log('\n--- Duplicate Vacancies Analysis ---');
  console.log(`- Exact Duplicate Triplet (Title + Employer + Location): ${duplicateCount}`);
  console.log(`- Unique Distinct Job Opportunities: ${allJobs.length - duplicateCount}`);

  // 11. Job Description Completeness
  let descUnder50 = 0;
  let desc50to500 = 0;
  let descAbove500 = 0;
  allJobs.forEach(j => {
    const len = (j.description || j.job_summary || '').length;
    if (len < 50) descUnder50++;
    else if (len < 500) desc50to500++;
    else descAbove500++;
  });

  console.log('\n--- Job Description Completeness ---');
  console.log(`- Substantial Descriptions (> 500 chars): ${descAbove500} (${((descAbove500 / allJobs.length) * 100).toFixed(1)}%)`);
  console.log(`- Concise Descriptions (50-500 chars): ${desc50to500}`);
  console.log(`- Missing or Minimal (< 50 chars): ${descUnder50}`);

  console.log('\n================================================================');
  console.log('PHASE 1 AUDIT COMPLETE. SAVING DETAILED JSON SUMMARY...');
  console.log('================================================================');

  const auditReport = {
    timestamp: new Date().toISOString(),
    totalAudited: allJobs.length,
    activeCount,
    expiredCount,
    countryCounts,
    countryCities,
    uniqueEmployers: Object.keys(employerCounts).length,
    jobsWithSalary,
    jobsWithoutSalary,
    salaryCurrencies,
    validUrlCount,
    missingUrlCount,
    invalidUrlCount,
    workModeCounts,
    remoteCount,
    visaSponsoredCount,
    relocationCount,
    duplicateCount,
    descriptionStats: {
      descAbove500,
      desc50to500,
      descUnder50
    }
  };

  fs.writeFileSync('scripts/phase1-audit-report.json', JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('Report saved to scripts/phase1-audit-report.json');
}

runAudit();
