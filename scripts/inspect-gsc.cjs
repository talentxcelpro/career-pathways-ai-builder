const fs = require('fs');
const path = require('path');

function inspectFolder(dir) {
  console.log(`\n=== INSPECTING: ${dir} ===`);
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    console.log(`\nFile: ${f} (${lines.length} lines)`);
    console.log('First 5 lines:');
    lines.slice(0, 5).forEach((line, idx) => console.log(`  [${idx}] ${line}`));
  }
}

inspectFolder(path.resolve('scratch/gsc_jobs'));
inspectFolder(path.resolve('scratch/gsc_root'));
