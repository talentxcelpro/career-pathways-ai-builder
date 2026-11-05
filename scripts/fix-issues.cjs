const fs = require('fs');

// 1. In App.tsx: ensure ProSubscription lazy import resolves either default or named export
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  'const ProSubscription = lazy(() => import("@/pages/pro/ProSubscription"));',
  'const ProSubscription = lazy(() => import("@/pages/pro/ProSubscription").then(m => ({ default: m.default || m.ProSubscription })));'
);
fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('✅ App.tsx: ProSubscription lazy import hardened');

// 2. In ProSubscription.tsx: harden current status rendering against null/object
let proSub = fs.readFileSync('src/pages/pro/ProSubscription.tsx', 'utf8');
if (!proSub.includes('export default ProSubscription;')) {
  proSub = proSub + '\nexport default ProSubscription;\n';
}
// Harden quota check
proSub = proSub.replace(
  '{quota && (\n                <span className="text-xs text-emerald-700">\n                  (ATS Checks Used: {quota.ats_check.used}{quota.ats_check.limit > 0 ? `/${quota.ats_check.limit}` : \' (Unlimited)\'})\n                </span>\n              )}',
  '{quota?.ats_check && (\n                <span className="text-xs text-emerald-700">\n                  (ATS Checks Used: {Number(quota.ats_check.used || 0)}{Number(quota.ats_check.limit || 0) > 0 ? `/${quota.ats_check.limit}` : \' (Unlimited)\'})\n                </span>\n              )}'
);
fs.writeFileSync('src/pages/pro/ProSubscription.tsx', proSub, 'utf8');
console.log('✅ ProSubscription.tsx: export default and quota hardening applied');
