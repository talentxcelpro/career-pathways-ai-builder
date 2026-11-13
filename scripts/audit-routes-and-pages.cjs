// scripts/audit-routes-and-pages.cjs
const fs = require('fs');
const path = require('path');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Match all Route definitions
const routeMatches = [...appContent.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map(m => m[1]);

console.log(`TOTAL REGISTERED ROUTES IN App.tsx: ${routeMatches.length}`);

// Group by product/universe pattern
const productBuckets = {
  resume: routeMatches.filter(r => r.includes('resume') || r.includes('cv')),
  jobs: routeMatches.filter(r => r.includes('job') || r.includes('location') || r.includes('role')),
  salary: routeMatches.filter(r => r.includes('salary') || r.includes('compensation') || r.includes('pay')),
  colleges: routeMatches.filter(r => r.includes('college') || r.includes('campus') || r.includes('/b/')),
  passport: routeMatches.filter(r => r.includes('passport') || r.includes('proof')),
  government: routeMatches.filter(r => r.includes('gov') || r.includes('sarkari')),
  careers: routeMatches.filter(r => r.includes('career') || r.includes('path')),
  learning: routeMatches.filter(r => r.includes('learn') || r.includes('course') || r.includes('skill') || r.includes('assessment')),
  employers: routeMatches.filter(r => r.includes('employer') || r.includes('recruiter') || r.includes('hire')),
  ca: routeMatches.filter(r => r.includes('ca') || r.includes('tax') || r.includes('accounting') || r.includes('audit')),
  legal: routeMatches.filter(r => r.includes('legal') || r.includes('contract')),
  services: routeMatches.filter(r => r.includes('service') || r.includes('consultation') || r.includes('booking')),
};

for (const [prod, routes] of Object.entries(productBuckets)) {
  console.log(`\n=== PRODUCT: ${prod.toUpperCase()} (${routes.length} matched routes) ===`);
  console.log(routes.slice(0, 10).join(', '));
}
