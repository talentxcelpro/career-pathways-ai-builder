const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the misplaced lines at top of App.tsx
app = app.replace(/^const ProSubscription = React\.lazy\([^)]+\);\r?\n/, '');
app = app.replace(/^const ProSubscriptionPolicy = React\.lazy\([^)]+\);\r?\n/, '');

// 2. Ensure React is explicitly imported
app = app.replace(
  'import { useEffect, lazy, Suspense } from "react";',
  'import React, { useEffect, lazy, Suspense } from "react";'
);

// 3. Put ProSubscription right next to other lazy imports
const target = 'const ReferAndEarn = lazy(() => import("@/pages/ReferAndEarn"));';
const replacement = target + '\nconst ProSubscription = lazy(() => import("@/pages/pro/ProSubscription"));\nconst ProSubscriptionPolicy = lazy(() => import("@/pages/pro/ProSubscriptionPolicy"));';

if (!app.includes('const ProSubscription = lazy')) {
  app = app.replace(target, replacement);
}

fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('✅ App.tsx repaired successfully!');
