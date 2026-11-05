const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  {
    target: '<Route path="/" element={<Suspense fallback={<div>Loading Jobs...</div>}><JobsPage /></Suspense>} />',
    rep: '<Route path="/" element={<Suspense fallback={<div>Loading Jobs...</div>}><SubdomainLandingPage universe="JOBS" /></Suspense>} />'
  },
  {
    target: `<Route path="/" element={<Suspense fallback={<div className="p-8 text-center text-xs font-semibold">Loading Learning Hub...</div>}><LearningHub /></Suspense>} />
                                      <Route path="/learning" element={<Suspense fallback={<div className="p-8 text-center text-xs font-semibold">Loading Learning Hub...</div>}><LearningHub /></Suspense>} />`,
    rep: `<Route path="/" element={<Suspense fallback={<div className="p-8 text-center text-xs font-semibold">Loading Learning Hub...</div>}><SubdomainLandingPage universe="LEARNING" /></Suspense>} />
                                      <Route path="/learning" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/hub" element={<Suspense fallback={null}><LearningHub /></Suspense>} />`
  },
  {
    target: `<Route path="/" element={<Suspense fallback={null}><CareerPassportDashboard /></Suspense>} />
                                      <Route path="/passport" element={<Suspense fallback={null}><CareerPassportDashboard /></Suspense>} />`,
    rep: `<Route path="/" element={<Suspense fallback={null}><SubdomainLandingPage universe="PASSPORT" /></Suspense>} />
                                      <Route path="/passport" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/dashboard" element={<Suspense fallback={null}><CareerPassportDashboard /></Suspense>} />`
  },
  {
    target: `<Route path="/" element={<Suspense fallback={<div>Loading...</div>}><GovernmentJobs /></Suspense>} />
                                      <Route path="/government-jobs" element={<Suspense fallback={<div>Loading...</div>}><GovernmentJobs /></Suspense>} />`,
    rep: `<Route path="/" element={<Suspense fallback={<div>Loading...</div>}><SubdomainLandingPage universe="GOVERNMENT" /></Suspense>} />
                                      <Route path="/government-jobs" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/government" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/vacancies" element={<Suspense fallback={<div>Loading...</div>}><GovernmentJobs /></Suspense>} />`
  },
  {
    target: `<Route path="/" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Recruiter OS...</div>}><RecruiterLandingPage /></Suspense>} />
                                      <Route path="/recruiters" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Recruiter OS...</div>}><RecruiterLandingPage /></Suspense>} />`,
    rep: `<Route path="/" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Recruiter OS...</div>}><SubdomainLandingPage universe="EMPLOYERS" /></Suspense>} />
                                      <Route path="/employer" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/employers" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/recruiters" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Recruiter OS...</div>}><RecruiterLandingPage /></Suspense>} />`
  },
  {
    target: `<Route path="/" element={<Suspense fallback={null}><Colleges /></Suspense>} />
                                      <Route path="/colleges" element={<Suspense fallback={null}><Colleges /></Suspense>} />`,
    rep: `<Route path="/" element={<Suspense fallback={null}><SubdomainLandingPage universe="COLLEGES" /></Suspense>} />
                                      <Route path="/colleges" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/directory" element={<Suspense fallback={null}><Colleges /></Suspense>} />`
  },
  {
    target: `<Route path="/" element={<AICareerHub />} />
                                      <Route path="/careers" element={<AICareerHub />} />`,
    rep: `<Route path="/" element={<Suspense fallback={null}><SubdomainLandingPage universe="CAREERS" /></Suspense>} />
                                      <Route path="/careers" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/career-map" element={<AICareerHub />} />`
  },
  {
    target: `<Route path="/" element={<Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Salary Analyzer...</div>}><SalaryAnalyzer /></Suspense>} />
                                      <Route path="/salary" element={<Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Salary Analyzer...</div>}><SalaryAnalyzer /></Suspense>} />`,
    rep: `<Route path="/" element={<Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Salary Analyzer...</div>}><SubdomainLandingPage universe="SALARY" /></Suspense>} />
                                      <Route path="/salary" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/analyzer" element={<Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Salary Analyzer...</div>}><SalaryAnalyzer /></Suspense>} />`
  },
  {
    target: `<Route path="/" element={<UnifiedResumeHub />} />
                                      <Route path="/resume" element={<UnifiedResumeHub />} />`,
    rep: `<Route path="/" element={<Suspense fallback={null}><SubdomainLandingPage universe="RESUME" /></Suspense>} />
                                      <Route path="/resume" element={<RedundantSuffixRedirect target="/" />} />
                                      <Route path="/studio" element={<UnifiedResumeHub />} />`
  }
];

// Normalize CRLF to LF for matching
const isCRLF = c.includes('\r\n');
let normC = c.replace(/\r\n/g, '\n');

replacements.forEach(({ target, rep }, idx) => {
  const normTarget = target.replace(/\r\n/g, '\n');
  const normRep = rep.replace(/\r\n/g, '\n');
  if (!normC.includes(normTarget)) {
    console.error(`Target not found for index ${idx + 1}: ${normTarget.substring(0, 60)}...`);
    process.exit(1);
  }
  normC = normC.replace(normTarget, normRep);
  console.log(`Replaced index ${idx + 1}`);
});

if (isCRLF) {
  normC = normC.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/App.tsx', normC);
console.log('App.tsx successfully updated with SubdomainLandingPage and RedundantSuffixRedirect across all 9 universes!');
