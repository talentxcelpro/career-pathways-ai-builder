const fs = require('fs');

// 1. Patch UniversalProfileRouteHandler.tsx
let upPath = 'src/components/profile/UniversalProfileRouteHandler.tsx';
let up = fs.readFileSync(upPath, 'utf8');
if (!up.includes("'pricing'")) {
  up = up.replace(
    "'career-insights', 'market-insights', 'career-analytics', 'insights', 'career-paths',",
    "'career-insights', 'market-insights', 'career-analytics', 'insights', 'career-paths',\n  'pricing', 'subscription', 'plans', 'pro', 'upgrade', 'store', 'rewards', 'billing', 'checkout',"
  );
  fs.writeFileSync(upPath, up, 'utf8');
  console.log('✅ UniversalProfileRouteHandler.tsx patched with reserved pricing routes');
} else {
  console.log('UniversalProfileRouteHandler.tsx already contains pricing');
}

// 2. Patch App.tsx to include ProSubscription and ProSubscriptionPolicy
let appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes("const ProSubscription")) {
  const importTarget = "const ReferAndEarn = lazy(() => import('@/pages/ReferAndEarn'));";
  const importReplacement = `const ReferAndEarn = lazy(() => import('@/pages/ReferAndEarn'));\nconst ProSubscription = lazy(() => import('@/pages/pro/ProSubscription'));\nconst ProSubscriptionPolicy = lazy(() => import('@/pages/pro/ProSubscriptionPolicy'));`;
  
  if (app.includes(importTarget)) {
    app = app.replace(importTarget, importReplacement);
  } else {
    // Fallback import addition
    app = `const ProSubscription = React.lazy(() => import('@/pages/pro/ProSubscription'));\nconst ProSubscriptionPolicy = React.lazy(() => import('@/pages/pro/ProSubscriptionPolicy'));\n` + app;
  }

  // Register routes in App.tsx
  const routeTarget = `<Route path="/careerverse" element={<Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>} />`;
  const routeAdditions = `${routeTarget}\n                                <Route path="/pricing" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Plans...</div>}><ProSubscription /></Suspense>} />\n                                <Route path="/subscription" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Plans...</div>}><ProSubscription /></Suspense>} />\n                                <Route path="/plans" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Plans...</div>}><ProSubscription /></Suspense>} />\n                                <Route path="/pro/subscription" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Plans...</div>}><ProSubscription /></Suspense>} />\n                                <Route path="/pro/policy" element={<Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Policy...</div>}><ProSubscriptionPolicy /></Suspense>} />`;

  if (app.includes(routeTarget)) {
    app = app.replace(routeTarget, routeAdditions);
    fs.writeFileSync(appPath, app, 'utf8');
    console.log('✅ App.tsx patched with /pricing, /subscription, /plans, /pro/subscription, /pro/policy routes');
  } else {
    console.error('Route target not found in App.tsx');
  }
} else {
  console.log('App.tsx already contains ProSubscription');
}
