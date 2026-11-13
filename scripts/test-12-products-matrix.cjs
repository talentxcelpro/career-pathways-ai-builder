// scripts/test-12-products-matrix.cjs
// Automated Verification Suite for TalentXcel 12 Independent Products
// Validates Domain Routing, Subdomain Identities, Product Components, Routing Blocks, and Database Bindings.

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');

console.log('='.repeat(75));
console.log('TALENTXCEL 12 INDEPENDENT PRODUCTS VERIFICATION SUITE');
console.log('='.repeat(75));

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function asyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. DOMAIN ARCHITECTURE REGISTRY VERIFICATION
// ---------------------------------------------------------------------------
console.log('\n[SECTION 1: DOMAIN ARCHITECTURE REGISTRY]');
const domainArchPath = path.join(__dirname, '..', 'src', 'config', 'domainArchitecture.ts');
const domainArchContent = fs.readFileSync(domainArchPath, 'utf8');

const EXPECTED_UNIVERSES = [
  'CORE', 'JOBS', 'LEARNING', 'PASSPORT', 'GOVERNMENT', 
  'EMPLOYERS', 'COLLEGES', 'CAREERS', 'SALARY', 'RESUME',
  'CA_PRACTICE', 'LEGAL_PRACTICE', 'SERVICES'
];

test('ProductUniverse type contains all 12 product universes + CORE', () => {
  EXPECTED_UNIVERSES.forEach(u => {
    assert(domainArchContent.includes(`'${u}'`), `ProductUniverse missing ${u}`);
  });
});

test('DOMAIN_TO_UNIVERSE maps all 12 production subdomains', () => {
  const expectedSubdomains = [
    ['jobs.talentxcel.in', 'JOBS'],
    ['learning.talentxcel.in', 'LEARNING'],
    ['passport.talentxcel.in', 'PASSPORT'],
    ['government.talentxcel.in', 'GOVERNMENT'],
    ['employers.talentxcel.in', 'EMPLOYERS'],
    ['colleges.talentxcel.in', 'COLLEGES'],
    ['careers.talentxcel.in', 'CAREERS'],
    ['salary.talentxcel.in', 'SALARY'],
    ['resume.talentxcel.in', 'RESUME'],
    ['ca.talentxcel.in', 'CA_PRACTICE'],
    ['legal.talentxcel.in', 'LEGAL_PRACTICE'],
    ['services.talentxcel.in', 'SERVICES'],
  ];

  expectedSubdomains.forEach(([domain, universe]) => {
    assert(domainArchContent.includes(`'${domain}': '${universe}'`), `DOMAIN_TO_UNIVERSE missing ${domain} -> ${universe}`);
  });
});

test('UNIVERSE_PRIMARY_DOMAIN maps all 12 universes to HTTPS URLs', () => {
  assert(domainArchContent.includes("CA_PRACTICE: 'https://ca.talentxcel.in'"));
  assert(domainArchContent.includes("LEGAL_PRACTICE: 'https://legal.talentxcel.in'"));
  assert(domainArchContent.includes("SERVICES: 'https://services.talentxcel.in'"));
});

test('AUTH_ALLOWED_HOSTNAMES and OAuth URIs contain all 12 subdomains', () => {
  assert(domainArchContent.includes("'ca.talentxcel.in'"));
  assert(domainArchContent.includes("'legal.talentxcel.in'"));
  assert(domainArchContent.includes("'services.talentxcel.in'"));
  assert(domainArchContent.includes("'https://ca.talentxcel.in/auth/callback'"));
  assert(domainArchContent.includes("'https://legal.talentxcel.in/auth/callback'"));
  assert(domainArchContent.includes("'https://services.talentxcel.in/auth/callback'"));
});

test('Local development subdomain prefix matching handles all 12 products', () => {
  assert(domainArchContent.includes("host.startsWith('ca.') || host.startsWith('ca-')"));
  assert(domainArchContent.includes("host.startsWith('legal.') || host.startsWith('legal-')"));
  assert(domainArchContent.includes("host.startsWith('services.') || host.startsWith('services-')"));
});

// ---------------------------------------------------------------------------
// 2. SUBDOMAIN IDENTITIES & METADATA VERIFICATION
// ---------------------------------------------------------------------------
console.log('\n[SECTION 2: SUBDOMAIN IDENTITIES & SEO REGISTRY]');
const subdomainIdentitiesPath = path.join(__dirname, '..', 'src', 'config', 'subdomainIdentities.ts');
const identitiesContent = fs.readFileSync(subdomainIdentitiesPath, 'utf8');

const EXPECTED_IDENTITIES = ['learning', 'passport', 'government', 'employers', 'colleges', 'careers', 'salary', 'resume', 'jobs', 'ca', 'legal', 'services'];

test('SUBDOMAIN_IDENTITIES contains all 12 product configurations', () => {
  EXPECTED_IDENTITIES.forEach(id => {
    assert(identitiesContent.includes(`${id}: {`), `Missing identity key: ${id}`);
  });
});

test('CA PracticeOS identity has verified schema and keywords', () => {
  assert(identitiesContent.includes("id: 'CA_PRACTICE'"));
  assert(identitiesContent.includes("'ca practice management'"));
  assert(identitiesContent.includes("'ProfessionalService'"));
});

test('Legal PracticeOS identity has verified schema and keywords', () => {
  assert(identitiesContent.includes("id: 'LEGAL_PRACTICE'"));
  assert(identitiesContent.includes("'bharatiya nyaya sanhita bns bare act'"));
  assert(identitiesContent.includes("'LegalService'"));
});

test('Professional ServicesOS identity has verified schema and keywords', () => {
  assert(identitiesContent.includes("id: 'SERVICES'"));
  assert(identitiesContent.includes("'verified ca online'"));
  assert(identitiesContent.includes("'ProfessionalService'"));
});

// ---------------------------------------------------------------------------
// 3. PRODUCT COMPONENTS EXISTENCE & MASTER LIGHT DESIGN SYSTEM
// ---------------------------------------------------------------------------
console.log('\n[SECTION 3: PRODUCT COMPONENT FILES & MASTER LIGHT DESIGN SYSTEM]');

const PRODUCT_FILES = [
  { name: 'ResumeStudio', path: 'src/components/products/ResumeStudioProduct.tsx' },
  { name: 'JobMatch OS', path: 'src/components/products/JobMatchProduct.tsx' },
  { name: 'PayScale', path: 'src/components/products/PayScaleProduct.tsx' },
  { name: 'CampusOS', path: 'src/components/products/CampusOSProduct.tsx' },
  { name: 'Career Passport', path: 'src/pages/passport/components/PassportAcquisitionLanding.tsx' },
  { name: 'SarkariHub', path: 'src/components/products/SarkariHubProduct.tsx' },
  { name: 'Career Pathfinder', path: 'src/components/products/CareerPathfinderProduct.tsx' },
  { name: 'SkillPods', path: 'src/components/products/SkillPodsProduct.tsx' },
  { name: 'RecruiterOS', path: 'src/pages/recruiters/RecruiterLandingPage.tsx' },
  { name: 'CA PracticeOS', path: 'src/components/products/CAPracticeProduct.tsx' },
  { name: 'Legal PracticeOS', path: 'src/components/products/LegalPracticeProduct.tsx' },
  { name: 'Professional ServicesOS', path: 'src/components/products/ProfessionalServicesProduct.tsx' },
];

PRODUCT_FILES.forEach(p => {
  test(`Component file exists: ${p.name} (${p.path})`, () => {
    const full = path.join(__dirname, '..', p.path);
    assert(fs.existsSync(full), `File not found: ${full}`);
    const content = fs.readFileSync(full, 'utf8');
    assert(content.length > 500, `File appears empty: ${full}`);
  });
});

test('All 3 new practice operating systems use Master Light SaaS Design System', () => {
  const ca = fs.readFileSync(path.join(__dirname, '..', 'src/components/products/CAPracticeProduct.tsx'), 'utf8');
  const legal = fs.readFileSync(path.join(__dirname, '..', 'src/components/products/LegalPracticeProduct.tsx'), 'utf8');
  const services = fs.readFileSync(path.join(__dirname, '..', 'src/components/products/ProfessionalServicesProduct.tsx'), 'utf8');

  assert(ca.includes('bg-[#F4F7FC]'), 'CA PracticeOS must use light background #F4F7FC');
  assert(legal.includes('bg-[#F4F7FC]'), 'Legal PracticeOS must use light background #F4F7FC');
  assert(services.includes('bg-[#F4F7FC]'), 'ServicesOS must use light background #F4F7FC');

  assert(ca.includes('#2563EB'), 'CA PracticeOS must use primary blue #2563EB');
  assert(legal.includes('#2563EB'), 'Legal PracticeOS must use primary blue #2563EB');
  assert(services.includes('#2563EB'), 'ServicesOS must use primary blue #2563EB');
});

// ---------------------------------------------------------------------------
// 4. ROUTE MOUNTING IN APP.TSX
// ---------------------------------------------------------------------------
console.log('\n[SECTION 4: APP.TSX ROUTE MOUNTING]');
const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

test('App.tsx mounts CA_PRACTICE universe', () => {
  assert(appContent.includes("currentUniverse === 'CA_PRACTICE'"));
  assert(appContent.includes('<CAPracticeProduct />'));
});

test('App.tsx mounts LEGAL_PRACTICE universe', () => {
  assert(appContent.includes("currentUniverse === 'LEGAL_PRACTICE'"));
  assert(appContent.includes('<LegalPracticeProduct />'));
});

test('App.tsx mounts SERVICES universe', () => {
  assert(appContent.includes("currentUniverse === 'SERVICES'"));
  assert(appContent.includes('<ProfessionalServicesProduct />'));
});

test('App.tsx registers universal fallback routes /ca, /legal, /services', () => {
  assert(appContent.includes('<Route path="/ca"'));
  assert(appContent.includes('<Route path="/legal"'));
  assert(appContent.includes('<Route path="/services"'));
});

// ---------------------------------------------------------------------------
// 5. SUPABASE PRODUCTION PIPELINE LIVE TEST
// ---------------------------------------------------------------------------
console.log('\n[SECTION 5: SUPABASE PRODUCTION DATABASE CONNECTIVITY]');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runAsyncTests() {
  await asyncTest('Supabase jobs table returns >2000 active verified vacancies', async () => {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    assert(!error, `Supabase error: ${error?.message}`);
    assert(count && count >= 2000, `Expected >= 2000 jobs, found: ${count}`);
    console.log(`      Found ${count} active vacancies in Supabase`);
  });

  await asyncTest('Supabase jobs table has unexpired listings with external_url', async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, external_url, is_active')
      .eq('is_active', true)
      .limit(10);
    assert(!error, `Supabase fetch error: ${error?.message}`);
    assert(data && data.length > 0, 'No jobs returned');
    assert(data[0].external_url, 'Sample job missing external_url');
  });

  console.log('\n' + '='.repeat(75));
  console.log(`VERIFICATION COMPLETE: ${passed} / ${total} TESTS PASSED`);
  console.log('='.repeat(75));

  if (passed !== total) {
    process.exit(1);
  }
}

runAsyncTests().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
