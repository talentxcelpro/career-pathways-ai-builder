// scripts/audit-12-products-forensic.cjs
// Forensic Audit & Capability Matrix Generator for all 12 TalentXcel Products

const fs = require('fs');
const path = require('path');

const PRODUCTS = [
  { id: 'resume', name: 'ResumeStudio', subdomain: 'resume.talentxcel.in', universe: 'RESUME', entry: 'src/components/products/ResumeStudioProduct.tsx' },
  { id: 'jobs', name: 'JobMatch OS', subdomain: 'jobs.talentxcel.in', universe: 'JOBS', entry: 'src/components/products/JobMatchProduct.tsx' },
  { id: 'salary', name: 'PayScale', subdomain: 'salary.talentxcel.in', universe: 'SALARY', entry: 'src/components/products/PayScaleProduct.tsx' },
  { id: 'colleges', name: 'CampusOS', subdomain: 'colleges.talentxcel.in', universe: 'COLLEGES', entry: 'src/components/products/CampusOSProduct.tsx' },
  { id: 'passport', name: 'Career Passport', subdomain: 'passport.talentxcel.in', universe: 'PASSPORT', entry: 'src/pages/passport/components/PassportAcquisitionLanding.tsx' },
  { id: 'government', name: 'SarkariHub', subdomain: 'government.talentxcel.in', universe: 'GOVERNMENT', entry: 'src/components/products/SarkariHubProduct.tsx' },
  { id: 'careers', name: 'Career Pathfinder', subdomain: 'careers.talentxcel.in', universe: 'CAREERS', entry: 'src/components/products/CareerPathfinderProduct.tsx' },
  { id: 'learning', name: 'SkillPods', subdomain: 'learning.talentxcel.in', universe: 'LEARNING', entry: 'src/components/products/SkillPodsProduct.tsx' },
  { id: 'employers', name: 'RecruiterOS', subdomain: 'employers.talentxcel.in', universe: 'EMPLOYERS', entry: 'src/pages/recruiters/RecruiterLandingPage.tsx' },
  { id: 'ca', name: 'CA PracticeOS', subdomain: 'ca.talentxcel.in', universe: 'CA_PRACTICE', entry: 'src/components/products/CAPracticeProduct.tsx' },
  { id: 'legal', name: 'Legal PracticeOS', subdomain: 'legal.talentxcel.in', universe: 'LEGAL_PRACTICE', entry: 'src/components/products/LegalPracticeProduct.tsx' },
  { id: 'services', name: 'Professional ServicesOS', subdomain: 'services.talentxcel.in', universe: 'SERVICES', entry: 'src/components/products/ProfessionalServicesProduct.tsx' },
];

console.log('='.repeat(70));
console.log('TALENTXCEL 12-PRODUCT FORENSIC REPOSITORY AUDIT');
console.log('='.repeat(70));

const results = [];

for (const prod of PRODUCTS) {
  const fullPath = path.join(__dirname, '..', prod.entry);
  const exists = fs.existsSync(fullPath);
  let lineCount = 0;
  let content = '';
  let hasSupabase = false;
  let hasInteractiveState = false;
  let hasBrokenMock = false;

  if (exists) {
    content = fs.readFileSync(fullPath, 'utf8');
    lineCount = content.split('\n').length;
    hasSupabase = content.includes('supabase');
    hasInteractiveState = content.includes('useState') || content.includes('useEffect');
    hasBrokenMock = content.includes('TODO') || content.includes('placeholder') || content.includes('dummy');
  }

  results.push({
    ...prod,
    exists,
    lineCount,
    hasSupabase,
    hasInteractiveState,
    hasBrokenMock
  });

  console.log(`\n[${prod.id.toUpperCase()}] ${prod.name} (${prod.subdomain})`);
  console.log(`  - File: ${prod.entry} -> ${exists ? `EXISTS (${lineCount} lines)` : 'NOT FOUND (MISSING)'}`);
  console.log(`  - Interactive State: ${hasInteractiveState}`);
  console.log(`  - Supabase Wired: ${hasSupabase}`);
}

console.log('\n' + '='.repeat(70));
console.log(`AUDITED ${PRODUCTS.length} PRODUCTS: ${results.filter(r => r.exists).length} exist, ${results.filter(r => !r.exists).length} missing.`);
console.log('='.repeat(70));
