const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `                                      {/* Specific & Wildcard Job Details (Strictly AFTER city and role hubs) */}
                                      <Route path="/jobs/:slugOrId" element={<Suspense fallback={<div>Loading...</div>}><JobDetails /></Suspense>} />
                                      <Route path="/:slugOrId" element={<Suspense fallback={<div>Loading...</div>}><JobDetails /></Suspense>} />`;

const newBlock = `                                      {/* Specific & Wildcard Job Details (Strictly AFTER city and role hubs) */}
                                      <Route path="/jobs/:slugOrId" element={<Suspense fallback={<div>Loading Job...</div>}><JobDetailPage /></Suspense>} />
                                      <Route path="/job/:slugOrId" element={<Suspense fallback={<div>Loading Job...</div>}><JobDetailPage /></Suspense>} />
                                      <Route path="/:slugOrId" element={<Suspense fallback={<div>Loading Job...</div>}><JobDetailPage /></Suspense>} />`;

// Normalize \r\n to \n for replacement
const isCRLF = content.includes('\r\n');
let normalized = content.replace(/\r\n/g, '\n');

if (normalized.includes(oldBlock.replace(/\r\n/g, '\n'))) {
  normalized = normalized.replace(oldBlock.replace(/\r\n/g, '\n'), newBlock.replace(/\r\n/g, '\n'));
  const finalContent = isCRLF ? normalized.replace(/\n/g, '\r\n') : normalized;
  fs.writeFileSync('src/App.tsx', finalContent, 'utf8');
  console.log('App.tsx JobDetailPage routes updated successfully!');
} else {
  console.error('Failed to locate oldBlock in App.tsx');
}
