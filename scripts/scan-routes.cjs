const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const routes = [];
const lines = app.split('\n');
lines.forEach((l, i) => {
  const m = l.match(/<Route\s+path=["']([^"']+)["']/);
  if (m) {
    routes.push({ line: i + 1, path: m[1] });
  }
});

const jobRoutes = routes.filter(r => 
  r.path.includes('job') || 
  r.path.includes('application') || 
  r.path.includes('hire') || 
  r.path.includes('recruiter') ||
  r.path.includes('candidate') ||
  r.path.includes('tracker')
);

console.log('Total routes:', routes.length);
console.log('Relevant job/recruiter routes in App.tsx:');
jobRoutes.forEach(r => console.log(`  Line ${r.line}: ${r.path}`));
