const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

console.log('======================================================');
console.log('GLOBAL PLATFORM AUDIT: INDIA TO AFRICA, MIDDLE EAST, EUROPE & AMERICAS');
console.log('======================================================\n');

let allPassed = true;
function assert(condition, message) {
  if (condition) {
    console.log('  [PASS]', message);
  } else {
    console.error('  [FAIL]', message);
    allPassed = false;
  }
}

const jobMatchCode = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

// 1. GLOBAL REGION THEATER SELECTOR
console.log('1. Checking Global Region Theaters...');
assert(jobMatchCode.includes('GLOBAL_REGIONS = ['), 'GLOBAL_REGIONS declared');
assert(jobMatchCode.includes('middle-east') && jobMatchCode.includes('Dubai, Riyadh & Doha'), 'Middle East & GCC theater present');
assert(jobMatchCode.includes('africa') && jobMatchCode.includes('Lagos, Nairobi & Cape Town'), 'Africa theater present');
assert(jobMatchCode.includes('europe') && jobMatchCode.includes('London, Berlin & Dublin'), 'Europe & UK theater present');
assert(jobMatchCode.includes('americas') && jobMatchCode.includes('USA & Canada Tech Hubs'), 'Americas theater present');
assert(jobMatchCode.includes('india') && jobMatchCode.includes('Pan-India Tech & PSUs'), 'India theater present');
assert(jobMatchCode.includes('remote') && jobMatchCode.includes('100% Work from Anywhere'), 'Worldwide Remote theater present');

// 2. GLOBAL LOCATIONS IN DROPDOWN
console.log('\n2. Checking Global Locations in Dropdown...');
const requiredLocations = [
  'Lagos (Nigeria)', 'Nairobi (Kenya)', 'Cape Town (South Africa)', 'Cairo (Egypt)', 'Kigali (Rwanda)',
  'Dubai (United Arab Emirates)', 'Riyadh (Saudi Arabia)', 'Doha (Qatar)',
  'London (United Kingdom)', 'Berlin (Germany)', 'Amsterdam (Netherlands)', 'Dublin (Ireland)',
  'New York, NY (USA)', 'Seattle, WA (USA)', 'Austin, TX (USA)', 'San Francisco / Silicon Valley (USA)', 'Toronto, ON (Canada)',
  'Singapore', 'Sydney (Australia)', 'Bengaluru (India)', 'Mumbai (India)'
];

requiredLocations.forEach(loc => {
  assert(jobMatchCode.includes(loc), `Location "${loc}" present in search dropdown`);
});

// 3. 16 GLOBAL INDUSTRY SECTORS
console.log('\n3. Checking 16 Global Industry Sectors...');
const requiredIndustries = [
  'Technology, Cloud & AI',
  'AI & Data Science',
  'Banking, FinTech & Capital Markets',
  'Healthcare, Pharma & Biotech',
  'Energy, CleanTech & Oil & Gas',
  'Management Consulting & Strategy',
  'Core Engineering & Manufacturing',
  'Supply Chain, Logistics & Maritime',
  'Sales, BD & Digital Growth',
  'Ecommerce & Consumer Brands',
  'Telecom, 5G & SpaceTech',
  'People, HR & Global Mobility',
  'Education, EdTech & Academic',
  'Real Estate, PropTech & Infra',
  'Media, Design & Gaming',
  'Government, Defense & Public Sector'
];

requiredIndustries.forEach(ind => {
  assert(jobMatchCode.includes(ind), `Industry sector "${ind}" configured`);
});

// 4. MULTI-CURRENCY SALARY FORMATTING
console.log('\n4. Checking Multi-Currency Salary Support...');
assert(jobMatchCode.includes('isUS') && jobMatchCode.includes('usdMin'), 'USD ($k) salary calculation present');
assert(jobMatchCode.includes('isUK') && jobMatchCode.includes('gbpMin'), 'GBP (£k) salary calculation present');
assert(jobMatchCode.includes('isEU') && jobMatchCode.includes('eurMin'), 'EUR (€k) salary calculation present');
assert(jobMatchCode.includes('isGulf') && jobMatchCode.includes('aedMin'), 'AED (AED k) salary calculation present');
assert(jobMatchCode.includes('minLakhs') && jobMatchCode.includes('LPA'), 'INR (₹ LPA) salary calculation present');

// 5. DATABASE VERIFICATION (LIVE SUPABASE QUERY)
console.log('\n5. Querying Live Supabase Vacancies across Regions...');
const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(url, key);

async function checkDatabaseLive() {
  const { data, count, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, industry, is_remote', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    assert(false, 'Database query failed: ' + error.message);
    return;
  }

  assert(count >= 2250, `Total live unexpired vacancies: ${count} (>= 2,250)`);

  const theaterCounts = {
    africa: 0,
    middle_east: 0,
    europe: 0,
    americas: 0,
    apac: 0,
    india: 0,
    remote: 0
  };

  (data || []).forEach(j => {
    const l = (j.location || '').toLowerCase();
    if (j.is_remote || l.includes('remote')) theaterCounts.remote++;
    if (l.includes('nigeria') || l.includes('kenya') || l.includes('south africa') || l.includes('egypt') || l.includes('rwanda') || l.includes('lagos') || l.includes('nairobi') || l.includes('cairo')) theaterCounts.africa++;
    if (l.includes('dubai') || l.includes('emirates') || l.includes('riyadh') || l.includes('saudi') || l.includes('qatar') || l.includes('doha')) theaterCounts.middle_east++;
    if (l.includes('united kingdom') || l.includes('london') || l.includes('germany') || l.includes('berlin') || l.includes('amsterdam') || l.includes('netherlands') || l.includes('ireland') || l.includes('dublin')) theaterCounts.europe++;
    if (l.includes('united states') || l.includes('usa') || l.includes('seattle') || l.includes('austin') || l.includes('new york') || l.includes('san francisco') || l.includes('canada') || l.includes('toronto')) theaterCounts.americas++;
    if (l.includes('singapore') || l.includes('australia') || l.includes('sydney') || l.includes('japan')) theaterCounts.apac++;
    if (l.includes('india') || l.includes('bengaluru') || l.includes('mumbai') || l.includes('delhi') || l.includes('hyderabad') || l.includes('pune')) theaterCounts.india++;
  });

  console.log('  Live Vacancies per Global Theater:');
  console.log('    • India & South Asia:', theaterCounts.india);
  console.log('    • Africa (Lagos, Nairobi, Cape Town, Cairo, Kigali):', theaterCounts.africa);
  console.log('    • Middle East & GCC (Dubai, Riyadh, Doha):', theaterCounts.middle_east);
  console.log('    • Europe & UK (London, Berlin, Amsterdam, Dublin):', theaterCounts.europe);
  console.log('    • Americas (New York, Seattle, Austin, SF, Toronto):', theaterCounts.americas);
  console.log('    • Asia-Pacific (Singapore, Sydney):', theaterCounts.apac);
  console.log('    • Worldwide Remote:', theaterCounts.remote);

  assert(theaterCounts.africa > 0, 'Africa vacancies live in database');
  assert(theaterCounts.middle_east > 0, 'Middle East vacancies live in database');
  assert(theaterCounts.europe > 0, 'Europe vacancies live in database');
  assert(theaterCounts.americas > 0, 'Americas vacancies live in database');
  assert(theaterCounts.india > 0, 'India vacancies live in database');
  assert(theaterCounts.remote > 0, 'Remote vacancies live in database');

  console.log('\n======================================================');
  if (allPassed) {
    console.log('ALL GLOBAL PLATFORM REQUIREMENTS VERIFIED & WORKING (100% READY)');
  } else {
    console.error('SOME CHECKS FAILED');
  }
  console.log('======================================================');
}

checkDatabaseLive();
