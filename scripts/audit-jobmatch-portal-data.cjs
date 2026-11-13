const { createClient } = require('@supabase/supabase-js');
const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(url, key);

async function runAudit() {
  console.log('--- AUDITING SUPABASE JOBS DATA ---');

  // 1. Total records
  const { count: totalRecords, error: err1 } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });

  // 2. Total active
  const { count: totalActive, error: err2 } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // 3. Total inactive / expired
  const { count: totalInactive } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false);

  console.log('Total Job Records in DB:', totalRecords);
  console.log('Active Jobs (is_active = true):', totalActive);
  console.log('Inactive Jobs (is_active = false):', totalInactive);

  // Fetch batches to extract distinct companies, cities, categories
  let allJobs = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, location_city, department, industry, is_active, created_at, expires_at, application_deadline, salary_min, salary_max, min_experience, max_experience, work_mode, is_remote')
      .range(from, from + step - 1);
    
    if (error || !data || data.length === 0) break;
    allJobs = allJobs.concat(data);
    if (data.length < step) break;
    from += step;
  }

  console.log(`Fetched ${allJobs.length} records for metadata analysis.`);

  const now = new Date();
  const unexpiredActive = allJobs.filter(j => {
    if (!j.is_active) return false;
    if (j.application_deadline && new Date(j.application_deadline) < now) return false;
    if (j.expires_at && new Date(j.expires_at) < now) return false;
    return true;
  });

  const expiredActive = allJobs.filter(j => {
    if (!j.is_active) return false;
    if (j.application_deadline && new Date(j.application_deadline) < now) return true;
    if (j.expires_at && new Date(j.expires_at) < now) return true;
    return false;
  });

  console.log('Active & strictly unexpired:', unexpiredActive.length);
  console.log('Active but past deadline/expiry:', expiredActive.length);

  // Companies
  const companiesMap = {};
  unexpiredActive.forEach(j => {
    const c = (j.company_name || '').trim();
    if (c) {
      companiesMap[c] = (companiesMap[c] || 0) + 1;
    }
  });

  const topCompanies = Object.entries(companiesMap)
    .sort((a, b) => b[1] - a[1]);

  console.log('Total Distinct Companies Hiring:', Object.keys(companiesMap).length);
  console.log('Top 10 Companies by Vacancies:');
  topCompanies.slice(0, 10).forEach(([comp, cnt]) => {
    console.log(`  - ${comp}: ${cnt} vacancies`);
  });

  // Locations / Cities
  const citiesMap = {};
  unexpiredActive.forEach(j => {
    const city = (j.location_city || j.location || '').trim();
    if (city) {
      // Extract key city names
      const lower = city.toLowerCase();
      let matchedCity = 'Other Locations';
      if (lower.includes('bengaluru') || lower.includes('bangalore')) matchedCity = 'Bengaluru';
      else if (lower.includes('hyderabad')) matchedCity = 'Hyderabad';
      else if (lower.includes('pune')) matchedCity = 'Pune';
      else if (lower.includes('noida')) matchedCity = 'Noida';
      else if (lower.includes('gurgaon') || lower.includes('gurugram')) matchedCity = 'Gurgaon';
      else if (lower.includes('delhi')) matchedCity = 'Delhi NCR';
      else if (lower.includes('mumbai')) matchedCity = 'Mumbai';
      else if (lower.includes('chennai')) matchedCity = 'Chennai';
      else if (lower.includes('kolkata')) matchedCity = 'Kolkata';
      else if (lower.includes('remote') || j.is_remote || j.work_mode === 'remote') matchedCity = 'Remote';
      else if (lower.includes('ahmedabad')) matchedCity = 'Ahmedabad';
      else if (lower.includes('bhopal')) matchedCity = 'Bhopal';
      else if (lower.includes('all india')) matchedCity = 'All India';

      citiesMap[matchedCity] = (citiesMap[matchedCity] || 0) + 1;
    }
  });

  console.log('\nTop Locations by Vacancies:');
  Object.entries(citiesMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([loc, cnt]) => {
      console.log(`  - ${loc}: ${cnt} vacancies`);
    });

  // Industries / Departments / Categories
  const departmentsMap = {};
  unexpiredActive.forEach(j => {
    const d = (j.department || j.industry || 'General').trim();
    departmentsMap[d] = (departmentsMap[d] || 0) + 1;
  });

  console.log('\nDepartments / Industries breakdown (top 15):');
  Object.entries(departmentsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([dept, cnt]) => {
      console.log(`  - ${dept}: ${cnt} vacancies`);
    });

  // Jobs added in last 7 days & 30 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recent7 = unexpiredActive.filter(j => new Date(j.created_at) >= sevenDaysAgo).length;
  const recent30 = unexpiredActive.filter(j => new Date(j.created_at) >= thirtyDaysAgo).length;

  console.log(`\nVacancies added in last 7 days: ${recent7}`);
  console.log(`Vacancies added in last 30 days: ${recent30}`);
}

runAudit();
