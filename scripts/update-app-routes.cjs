// scripts/update-app-routes.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add lazy imports
const targetImport = "const SarkariHubProduct               = lazy(() => import('@/components/products/SarkariHubProduct').then(m => ({ default: m.SarkariHubProduct })));";
const newImports = `const CAPracticeProduct             = lazy(() => import('@/components/products/CAPracticeProduct').then(m => ({ default: m.CAPracticeProduct })));
const LegalPracticeProduct           = lazy(() => import('@/components/products/LegalPracticeProduct').then(m => ({ default: m.LegalPracticeProduct })));
const ProfessionalServicesProduct    = lazy(() => import('@/components/products/ProfessionalServicesProduct').then(m => ({ default: m.ProfessionalServicesProduct })));`;

if (!content.includes('CAPracticeProduct')) {
  content = content.replace(targetImport, `${targetImport}\n${newImports}`);
}

// 2. Add universe blocks after RESUME universe
const resumeScannerTarget = '<Route path="/resume-scanner" element={<Navigate to="/resume/ats-check" replace />} />\n                                    </>\n                                  )}';

const universeBlocks = `
                                  {currentUniverse === 'CA_PRACTICE' && (
                                    <>
                                      <Route path="/" element={<Suspense fallback={<div>Loading CA PracticeOS...</div>}><CAPracticeProduct /></Suspense>} />
                                      <Route path="/ca" element={<RedundantSuffixRedirect target="/" />} />
                                    </>
                                  )}

                                  {currentUniverse === 'LEGAL_PRACTICE' && (
                                    <>
                                      <Route path="/" element={<Suspense fallback={<div>Loading Legal PracticeOS...</div>}><LegalPracticeProduct /></Suspense>} />
                                      <Route path="/legal" element={<RedundantSuffixRedirect target="/" />} />
                                    </>
                                  )}

                                  {currentUniverse === 'SERVICES' && (
                                    <>
                                      <Route path="/" element={<Suspense fallback={<div>Loading Professional ServicesOS...</div>}><ProfessionalServicesProduct /></Suspense>} />
                                      <Route path="/services" element={<RedundantSuffixRedirect target="/" />} />
                                    </>
                                  )}`;

if (!content.includes("currentUniverse === 'CA_PRACTICE'")) {
  if (content.includes(resumeScannerTarget)) {
    content = content.replace(resumeScannerTarget, `${resumeScannerTarget}\n${universeBlocks}`);
  } else {
    // Try matching with crlf
    const crlfTarget = resumeScannerTarget.replace(/\n/g, '\r\n');
    content = content.replace(crlfTarget, `${crlfTarget}\r\n${universeBlocks.replace(/\n/g, '\r\n')}`);
  }
}

// 3. Add universal fallback routes under Universal Product Hub Routes
const universalHeader = '{/* Universal Product Hub Routes (Accessible on CORE domain, localhost, and cross-subdomain) */}';
const universalRoutes = `
                {/* 12 Products Independent Practice Hubs */}
                <Route path="/ca" element={<Suspense fallback={<div>Loading CA PracticeOS...</div>}><CAPracticeProduct /></Suspense>} />
                <Route path="/legal" element={<Suspense fallback={<div>Loading Legal PracticeOS...</div>}><LegalPracticeProduct /></Suspense>} />
                <Route path="/services" element={<Suspense fallback={<div>Loading Professional ServicesOS...</div>}><ProfessionalServicesProduct /></Suspense>} />`;

if (!content.includes('12 Products Independent Practice Hubs')) {
  content = content.replace(universalHeader, `${universalHeader}${universalRoutes}`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated App.tsx with 3 new practice products');
