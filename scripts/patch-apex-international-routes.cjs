const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                {/* Specific Job Detail Routes - UUID and slug patterns */}
                <Route path="/jobs/:slugOrId" element={`;

const replacement = `                {/* International SEO Hub Routes (India + UAE + US Expansion) */}
                <Route path="/jobs/data-analyst-dubai-uae" element={<Suspense fallback={<div>Loading Hub...</div>}><InternationalJobLandingPage hubId="data-analyst-dubai-uae" /></Suspense>} />
                <Route path="/jobs/software-engineer-abu-dhabi-uae" element={<Suspense fallback={<div>Loading Hub...</div>}><InternationalJobLandingPage hubId="software-engineer-abu-dhabi-uae" /></Suspense>} />
                <Route path="/jobs/cloud-engineer-riyadh-saudi-arabia" element={<Suspense fallback={<div>Loading Hub...</div>}><InternationalJobLandingPage hubId="cloud-engineer-riyadh-saudi-arabia" /></Suspense>} />
                <Route path="/jobs/data-analyst-remote-usa" element={<Suspense fallback={<div>Loading Hub...</div>}><InternationalJobLandingPage hubId="data-analyst-remote-usa" /></Suspense>} />
                <Route path="/jobs/software-engineer-remote-us" element={<Suspense fallback={<div>Loading Hub...</div>}><InternationalJobLandingPage hubId="software-engineer-remote-us" /></Suspense>} />

                {/* Specific Job Detail Routes - UUID and slug patterns */}
                <Route path="/jobs/:slugOrId" element={`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Successfully registered international hub routes on apex in src/App.tsx');
