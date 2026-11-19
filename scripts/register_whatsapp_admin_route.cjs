const fs = require('fs');
const path = require('path');

const appPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(appPath, 'utf-8');

if (!content.includes('WhatsAppAlertsAdmin')) {
  // 1. Add lazy import
  content = content.replace(
    'const SocialMarketingDashboard = lazy(() => import("@/pages/admin/SocialMarketingDashboard"));',
    'const WhatsAppAlertsAdmin = lazy(() => import("@/pages/admin/WhatsAppAlertsAdmin"));\nconst SocialMarketingDashboard = lazy(() => import("@/pages/admin/SocialMarketingDashboard"));'
  );

  // 2. Add route
  content = content.replace(
    '<Route path="/admin/social-marketing" element={<AdminLayout><SocialMarketingDashboard /></AdminLayout>} />',
    '<Route path="/admin/whatsapp-alerts" element={<AdminLayout><WhatsAppAlertsAdmin /></AdminLayout>} />\n                                 <Route path="/admin/social-marketing" element={<AdminLayout><SocialMarketingDashboard /></AdminLayout>} />'
  );

  fs.writeFileSync(appPath, content, 'utf-8');
  console.log('Successfully registered /admin/whatsapp-alerts route in App.tsx');
} else {
  console.log('WhatsAppAlertsAdmin already registered in App.tsx');
}
