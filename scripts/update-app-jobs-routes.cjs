const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /(currentUniverse === ['"]JOBS['"] && \(\s*<>[\s\S]*?<Route path="\/jobs" element=\{<Suspense fallback=\{<div>Loading Jobs\.\.\.<\/div>\}>)<JobsPage \/>(<\/Suspense>\} \/>)/;

const additionalRoutes = `<JobMatchProduct /></Suspense>} />
                                      <Route path="/post" element={<Suspense fallback={<div>Loading Job Composer...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/post-job" element={<Suspense fallback={<div>Loading Job Composer...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/hire" element={<Suspense fallback={<div>Loading Employer Workspace...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/manage" element={<Suspense fallback={<div>Loading Job Manager...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/tracker" element={<Suspense fallback={<div>Loading Application Tracker...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/applications" element={<Suspense fallback={<div>Loading Applications...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/applied" element={<Suspense fallback={<div>Loading Applications...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/saved" element={<Suspense fallback={<div>Loading Saved Jobs...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/talent" element={<Suspense fallback={<div>Loading Talent Search...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/candidates" element={<Suspense fallback={<div>Loading Candidates...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/match" element={<Suspense fallback={<div>Loading AI Match...</div>}><JobMatchProduct /></Suspense>} />
                                      <Route path="/interview-prep" element={<Suspense fallback={<div>Loading Interview Prep...</div>}><JobMatchProduct /></Suspense>} />`;

if (regex.test(content)) {
  content = content.replace(regex, `$1${additionalRoutes}`);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully mounted all JobMatch OS routes inside JOBS universe!');
} else {
  console.log('Regex did not match');
}
