// backlink-engine/src/scripts/checkAppRoutes.cjs
const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../../../src/App.tsx');
if (!fs.existsSync(appPath)) {
  console.log('src/App.tsx does not exist');
  process.exit(1);
}

const content = fs.readFileSync(appPath, 'utf8');
const routes = [...content.matchAll(/path=["']([^"']*)["']/g)].map(m => m[1]);

console.log('Total routes found in App.tsx:', routes.length);
console.log('Relevant routes matching keywords:');
const keywords = ['resume', 'scanner', 'salary', 'employer', 'college', 'learn', 'bench'];
routes.forEach(r => {
  if (keywords.some(k => r.toLowerCase().includes(k))) {
    console.log('  -', r);
  }
});
