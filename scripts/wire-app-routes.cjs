const fs = require('fs');
const path = require('path');

const appPath = path.resolve('src/App.tsx');
let code = fs.readFileSync(appPath, 'utf8');

// 1. Add Lazy Imports
if (!code.includes('PublicVanityPassport')) {
  code = code.replace(
    "const PublicPassport                  = lazy(() => import('./pages/passport/PublicPassport'));",
    `const PublicPassport                  = lazy(() => import('./pages/passport/PublicPassport'));\nconst PublicVanityPassport            = lazy(() => import('./pages/passport/PublicVanityPassport'));\nconst PeerEndorsementPage             = lazy(() => import('./pages/passport/PeerEndorsementPage'));`
  );
}

// 2. Add Routes right before <Route path="/profile/:username"
const targetProfileRoute = '<Route path="/profile/:username" element={<UniversalProfileRouteHandler />} />';

const newVanityRoutes = `{/* Vanity Career Passport & Viral Peer Endorsements (High-Converting PLG Engine) */}
                                 <Route path="/u/:username" element={<Suspense fallback={null}><PublicVanityPassport /></Suspense>} />
                                 <Route path="/verify/:username" element={<Suspense fallback={null}><PeerEndorsementPage /></Suspense>} />
                                 <Route path="/resume/:role" element={<Suspense fallback={null}><UnifiedResumeBuilder /></Suspense>} />

                                 ${targetProfileRoute}`;

if (code.includes(targetProfileRoute) && !code.includes('path="/u/:username"')) {
  code = code.replace(targetProfileRoute, newVanityRoutes);
}

// 3. Also add under subdomain route tables
const passportSubdomainAnchor = '<Route path="/passport/public/:identifier" element={<Suspense fallback={null}><PublicPassport /></Suspense>} />';
const newSubdomainRoutes = `<Route path="/passport/public/:identifier" element={<Suspense fallback={null}><PublicPassport /></Suspense>} />
                                       <Route path="/u/:username" element={<Suspense fallback={null}><PublicVanityPassport /></Suspense>} />
                                       <Route path="/verify/:username" element={<Suspense fallback={null}><PeerEndorsementPage /></Suspense>} />`;

if (code.includes(passportSubdomainAnchor) && !code.includes('path="/u/:username" element={<Suspense fallback={null}><PublicVanityPassport /></Suspense>} />')) {
  code = code.replace(passportSubdomainAnchor, newSubdomainRoutes);
}

fs.writeFileSync(appPath, code, 'utf8');
console.log('✓ Successfully wired /u/:username, /verify/:username, and /resume/:role into App.tsx');
