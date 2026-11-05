const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = '<Route path="/ats-checker" element={<ATSChecker />} />';
const replacement1 = '<Route path="/ats-checker" element={<ATSChecker />} />\n                <Route path="/resume-scanner" element={<Navigate to="/resume/ats-check" replace />} />';

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('Successfully replaced target1 at universal routes!');
} else {
  console.log('Target1 not found!');
}

const target2 = '<Route path="/:username" element={<UniversalProfileRouteHandler />} />';
const replacement2 = '{/* Legacy /resume-scanner redirect before username catch-all */}\n                                 <Route path="/resume-scanner" element={<Navigate to="/resume/ats-check" replace />} />\n                                 <Route path="/:username" element={<UniversalProfileRouteHandler />} />';

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log('Successfully replaced target2 before username catch-all!');
} else {
  console.log('Target2 not found!');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done updating src/App.tsx');
