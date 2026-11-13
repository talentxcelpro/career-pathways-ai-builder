const fs = require('fs');

console.log('===========================================================');
console.log('AUDITING CODEBASE FOR FOUNDER UX & DATA DIRECTIVES:');
console.log('===========================================================');

const jobMatchContent = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');
const reqWorkspace = fs.readFileSync('src/components/products/jobmatch/EmployerRequisitionWorkspace.tsx', 'utf8');
const aiMatch = fs.readFileSync('src/components/products/jobmatch/AIMatchWorkspace.tsx', 'utf8');
const header = fs.readFileSync('src/components/products/jobmatch/JobPortalHeader.tsx', 'utf8');

let failed = false;

// 1. Mock Data Checks
console.log('\n[1. ZERO MOCK DATA AUDIT]');
if (jobMatchContent.includes('FALLBACK_JOBS')) {
  console.log('  ✗ [FAIL] FALLBACK_JOBS still present in JobMatchProduct.tsx');
  failed = true;
} else {
  console.log('  ✓ [PASS] Zero FALLBACK_JOBS (fake jobs eliminated)');
}

if (reqWorkspace.includes('SAMPLE_APPLICANTS')) {
  console.log('  ✗ [FAIL] SAMPLE_APPLICANTS still present in EmployerRequisitionWorkspace.tsx');
  failed = true;
} else {
  console.log('  ✓ [PASS] Zero SAMPLE_APPLICANTS (fake applicants eliminated)');
}

if (aiMatch.includes('Arvind Sharma') || jobMatchContent.includes('Arvind Sharma')) {
  console.log('  ✗ [FAIL] Arvind Sharma mock candidate still present');
  failed = true;
} else {
  console.log('  ✓ [PASS] Zero Arvind Sharma (fabricated candidate eliminated)');
}

// 2. Navigation Cleanliness
console.log('\n[2. NAVIGATION AUDIT]');
if (jobMatchContent.includes('ProductHeader')) {
  console.log('  ✗ [FAIL] ProductHeader with 12-product nav still imported in JobMatchProduct');
  failed = true;
} else {
  console.log('  ✓ [PASS] 12-product switcher and duplicate headers eliminated');
}

if (!jobMatchContent.includes('JobPortalHeader')) {
  console.log('  ✗ [FAIL] JobPortalHeader not mounted in JobMatchProduct');
  failed = true;
} else {
  console.log('  ✓ [PASS] Single clean JobPortalHeader mounted');
}

const headerItems = ['Find Jobs', 'Companies', 'Salary Guide', 'Resume', 'Post a Job'];
const missingHeaderItems = headerItems.filter(item => !header.includes(item));
if (missingHeaderItems.length > 0) {
  console.log('  ✗ [FAIL] Missing header items:', missingHeaderItems);
  failed = true;
} else {
  console.log('  ✓ [PASS] All required header links present:', headerItems.join(', '));
}

// 3. Default View & Categories
console.log('\n[3. JOB DISCOVERY & DEFAULT VIEW]');
if (jobMatchContent.includes("useState<'all' | 'tech' | 'non-tech' | 'core'>('all')")) {
  console.log('  ✓ [PASS] Default category set to "all" (All Vacancies show on load)');
} else {
  console.log('  ✗ [FAIL] Default category is not "all"');
  failed = true;
}

if (jobMatchContent.includes('All Vacancies') && jobMatchContent.includes('Tech & IT Jobs') && jobMatchContent.includes('Non-Tech & Business') && jobMatchContent.includes('Core Engineering & PSU')) {
  console.log('  ✓ [PASS] All 4 category filter tabs mounted cleanly');
} else {
  console.log('  ✗ [FAIL] Missing one or more category tabs');
  failed = true;
}

console.log('===========================================================');
if (failed) {
  console.log('AUDIT RESULT: SOME CHECKS FAILED');
  process.exit(1);
} else {
  console.log('AUDIT RESULT: ALL FOUNDER DIRECTIVES PASSED PERFECTLY!');
  process.exit(0);
}
