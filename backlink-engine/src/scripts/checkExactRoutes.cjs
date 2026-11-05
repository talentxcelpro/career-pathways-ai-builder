// backlink-engine/src/scripts/checkExactRoutes.cjs
const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../../../src/App.tsx');
const content = fs.readFileSync(appPath, 'utf8');

const targets = ['/resume-scanner', '/resume/ats-check', '/tools/resume-checker', '/employers', '/employer', '/colleges', '/learning', '/salary'];

targets.forEach(t => {
  const hasExact = content.includes(`path="${t}"`) || content.includes(`path='${t}'`);
  console.log(`Route [${t}]: exact match in App.tsx? ${hasExact}`);
});
