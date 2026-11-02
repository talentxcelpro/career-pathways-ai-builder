const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir);
const bucketNames = new Set();

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const regex = /INSERT INTO storage\.buckets\s*\([^)]*\)\s*VALUES\s*\(\s*['"]([a-zA-Z0-9_-]+)['"]/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    bucketNames.add(match[1]);
  }
  const regex2 = /bucket_id\s*=\s*['"]([a-zA-Z0-9_-]+)['"]/gi;
  while ((match = regex2.exec(content)) !== null) {
    bucketNames.add(match[1]);
  }
});

console.log('Buckets found in migrations:', Array.from(bucketNames));
