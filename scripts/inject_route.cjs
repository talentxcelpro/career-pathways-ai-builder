const fs = require('fs');

const appTsxPath = 'src/App.tsx';
let content = fs.readFileSync(appTsxPath, 'utf-8');

if (!content.includes('GrowthFunnelDashboard')) {
  // Add import
  const importStatement = `const GrowthFunnelDashboard = lazy(() => import("@/pages/admin/GrowthFunnelDashboard"));\n`;
  content = content.replace(/(const [A-Za-z]+ = lazy\(\(\) => import\("[^"]+"\)\);)/, `${importStatement}$1`);
  
  // Add route
  const routeStatement = `<Route path="/admin/growth-funnel" element={<GrowthFunnelDashboard />} />\n          `;
  content = content.replace(/(<Route path="\/admin\/[^"]+" element=\{<[^>]+>\} \/>\s*)/, `${routeStatement}$1`);
  
  fs.writeFileSync(appTsxPath, content, 'utf-8');
  console.log("Injected GrowthFunnelDashboard route into App.tsx");
} else {
  console.log("Route already exists in App.tsx");
}
