const fs = require('fs');
const path = require('path');

const targetDirs = ['api', 'src', 'supabase/functions', 'scripts', 'server', 'mcp'];
const results = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.temp') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && /\.(ts|tsx|js|cjs|mjs)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('profiles')) return;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(".from('profiles')") || line.includes('.from("profiles")')) {
      // Look ahead a few lines to capture .select(...)
      const context = lines.slice(i, Math.min(i + 8, lines.length)).join(' ');
      const selectMatch = context.match(/\.select\(([^)]+)\)/);
      const selectCols = selectMatch ? selectMatch[1].replace(/\s+/g, ' ').trim() : 'unknown';

      // Infer key / client used
      let keyUsed = 'Client (anon/user)';
      if (filePath.includes('supabase/functions') || content.includes('SUPABASE_SERVICE_ROLE_KEY') || content.includes('serviceRole') || context.includes('adminClient') || context.includes('supabaseAdmin')) {
        keyUsed = 'Service Role (backend)';
      } else if (context.includes('supabase.') || context.includes('client.')) {
        keyUsed = 'Frontend Client (anon if logged out, authenticated JWT if logged in)';
      }

      results.push({
        file: filePath.replace(/\\/g, '/'),
        line: i + 1,
        select: selectCols,
        keyUsed
      });
    }
  }
}

targetDirs.forEach(d => scanDir(path.resolve(d)));

console.log(`Found ${results.length} reads of 'profiles'.`);
fs.writeFileSync('profiles_reads_inventory.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved to profiles_reads_inventory.json');
