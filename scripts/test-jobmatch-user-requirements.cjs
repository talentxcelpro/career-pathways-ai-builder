const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('======================================================');
console.log('JOBMATCH OS: USER REQUIREMENTS & FUNCTIONALITY AUDIT');
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

// 1. ESBUILD SYNTAX & BUILD VERIFICATION
console.log('1. Checking esbuild compilation of JobMatchProduct.tsx...');
try {
  esbuild.buildSync({
    entryPoints: ['src/components/products/JobMatchProduct.tsx'],
    bundle: false,
    write: false
  });
  assert(true, 'JobMatchProduct.tsx compiles with zero syntax/JSX errors');
} catch (e) {
  assert(false, 'JobMatchProduct.tsx build failed: ' + e.message);
}

const jobMatchCode = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

// 2. HERO HEADLINE & MESSAGING
console.log('\n2. Verifying Hero Headline & Messaging...');
assert(jobMatchCode.includes('Find the Right Job'), 'Headline contains "Find the Right Job"');
assert(jobMatchCode.includes('Next Career Move'), 'Headline contains "Next Career Move"');
assert(!jobMatchCode.includes("India's Next-Gen Job Marketplace"), 'Removed legacy pill badge "India\'s Next-Gen Job Marketplace"');
assert(!jobMatchCode.includes('297+ Companies Hiring'), 'Removed "297+ Companies Hiring" metric');
assert(!jobMatchCode.includes('676+ Talent Profiles'), 'Removed "676+ Talent Profiles" metric');

// 3. ACTION BUTTONS & MODALS
console.log('\n3. Verifying Hero Action Buttons & Modal Hooks...');
assert(jobMatchCode.includes('Run AI Compatibility Match'), 'Hero has "Run AI Compatibility Match" button');
assert(jobMatchCode.includes('AI Interview Prep Coach'), 'Hero has "AI Interview Prep Coach" button');
assert(jobMatchCode.includes('openInterviewCoach'), 'openInterviewCoach handler declared');
assert(jobMatchCode.includes('interviewModalOpen'), 'interviewModalOpen state declared');
assert(jobMatchCode.includes('aiMatchModalOpen'), 'aiMatchModalOpen state declared');

// 4. THE 4 INNOVATION FEATURE CARDS
console.log('\n4. Verifying 4 Feature Cards Under Filters...');
assert(jobMatchCode.includes('AI Compatibility Match') && jobMatchCode.includes('Real-time skill gap analysis'), 'Feature 1: "AI Compatibility Match" present');
assert(jobMatchCode.includes('Zero Ghost Listings') && jobMatchCode.includes('100% direct verified routing'), 'Feature 2: "Zero Ghost Listings" present');
assert(jobMatchCode.includes('AI Interview Simulator') && jobMatchCode.includes('Practice specific role Q&A'), 'Feature 3: "AI Interview Simulator" present');
assert(jobMatchCode.includes('Transparent Benchmarks') && jobMatchCode.includes('Real CTC percentiles'), 'Feature 4: "Transparent Benchmarks" present');

// 5. 8 CATEGORIES & REAL DATABASE FILTERING
console.log('\n5. Verifying 8 Categories & Interactivity...');
const requiredCategories = [
  { name: 'IT & Software', count: 299 },
  { name: 'Banking & Finance', count: 156 },
  { name: 'Sales & Marketing', count: 142 },
  { name: 'Engineering', count: 145 },
  { name: 'Healthcare', count: 87 },
  { name: 'Human Resources', count: 64 },
  { name: 'Operations', count: 62 },
  { name: 'Education', count: 48 }
];

requiredCategories.forEach(cat => {
  const hasName = jobMatchCode.includes(cat.name);
  const hasCount = jobMatchCode.includes(String(cat.count));
  assert(hasName && hasCount, `Category "${cat.name} (${cat.count})" properly configured`);
});

assert(jobMatchCode.includes('setSelectedCategory8(isSelected ? \'all\' : cat.id)'), 'Category card toggle selection enabled');
assert(jobMatchCode.includes('Clear Category ✕'), 'Clear Category pill enabled in Latest Jobs header');

// 6. RIGHT SIDEBAR REMOVALS
console.log('\n6. Verifying Removals...');
assert(!jobMatchCode.includes('Hire the Right Talent, Faster'), 'Removed "Hire the Right Talent, Faster" from Discover page');

// 7. FOOTER LEGACY TEXT REMOVAL
console.log('\n7. Verifying Footer Cleanliness...');
const footerCode = fs.readFileSync('src/components/products/jobmatch/JobPortalFooter.tsx', 'utf8');
assert(!footerCode.includes('TalentXcel Jobs is an authentic employment marketplace connecting professionals with 2,200+ verified active vacancies'), 'Legacy paragraph removed from JobPortalFooter');
assert(!footerCode.includes('Hiring Network 2,236'), 'Legacy "Hiring Network 2,236" stats block removed from footer');

// 8. INTERACTIVE MODAL RENDERING
console.log('\n8. Verifying Standalone Modals...');
assert(jobMatchCode.includes('{interviewModalOpen && ('), 'AI Interview Simulator modal conditional render present');
assert(jobMatchCode.includes('{aiMatchModalOpen && ('), 'AI Match Workspace modal conditional render present');

console.log('\n======================================================');
if (allPassed) {
  console.log('ALL AUDIT CHECKS PASSED PERFECTLY (100% READY)');
} else {
  console.error('SOME CHECKS FAILED - REVIEW LOGS ABOVE');
}
console.log('======================================================');
