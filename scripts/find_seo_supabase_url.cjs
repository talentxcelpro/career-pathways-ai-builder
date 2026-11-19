const fs = require('fs');
const content = fs.readFileSync('api/seo-render.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('SUPABASE_REST_URL') || line.includes('SUPABASE_ANON_KEY')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
