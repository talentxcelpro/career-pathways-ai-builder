const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git')) results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.cjs')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('plus is not defined') || content.includes('Run AI Compatibility') || content.includes('plus when')) {
    console.log('Found in:', file);
  }
}
