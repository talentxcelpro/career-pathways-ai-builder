// scripts/add-testing-dashboard-routes.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add lazy import
const targetImport = "const ProfessionalServicesProduct    = lazy(() => import('@/components/products/ProfessionalServicesProduct').then(m => ({ default: m.ProfessionalServicesProduct })));";
const newImport = `const LocalTestingDashboard         = lazy(() => import('@/pages/LocalTestingDashboard').then(m => ({ default: m.LocalTestingDashboard })));`;

if (!content.includes('LocalTestingDashboard')) {
  content = content.replace(targetImport, `${targetImport}\n${newImport}`);
}

// 2. Add routes
const targetRoute = '{/* 12 Products Independent Practice Hubs */}';
const newRoutes = `{/* 12 Products Independent Practice Hubs & Central Testing Matrix */}
                <Route path="/products" element={<Suspense fallback={<div>Loading 12 Products Matrix...</div>}><LocalTestingDashboard /></Suspense>} />
                <Route path="/local-testing-index" element={<Suspense fallback={<div>Loading Local Testing Index...</div>}><LocalTestingDashboard /></Suspense>} />
                <Route path="/12-products" element={<Suspense fallback={<div>Loading 12 Products Matrix...</div>}><LocalTestingDashboard /></Suspense>} />`;

if (!content.includes('/local-testing-index')) {
  content = content.replace(targetRoute, newRoutes);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added LocalTestingDashboard routes to App.tsx');
