const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir);
const policies = [];

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const regex = /CREATE POLICY\s+["']([^"']+)["']\s+ON\s+storage\.objects[^;]+;/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    policies.push({ file: f, policy: match[0] });
  }
});

console.log(`Found ${policies.length} storage.objects policies in migrations.`);
policies.slice(0, 10).forEach(p => console.log(`[${p.file}]\n${p.policy}\n`));
