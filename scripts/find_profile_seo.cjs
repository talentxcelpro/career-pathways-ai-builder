const fs = require('fs');
const content = fs.readFileSync('api/seo-render.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('public_profiles') || line.includes('candidate_privacy_consents') || line.includes('profile')) {
    if (line.includes('public_profiles') || line.includes('passport') || line.includes('candidate')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
