const fs = require('fs');

// 1. Patch src/App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('CareerVersePage = lazy(')) {
  app = app.replace(
    'const RealTimeChat                    = lazy(() => import(\'@/components/realtime/RealTimeChat\').then(m => ({ default: m.RealTimeChat })));',
    'const RealTimeChat                    = lazy(() => import(\'@/components/realtime/RealTimeChat\').then(m => ({ default: m.RealTimeChat })));\r\nconst CareerVersePage                 = lazy(() => import(\'./pages/CareerVersePage\'));'
  );
}

const targetPriority = '{/* PRIORITY ROUTES - These must come BEFORE navItems.map to take precedence */}';
const priorityRoutes = `{/* PRIORITY ROUTES - These must come BEFORE navItems.map to take precedence */}
                <Route path="/play" element={
                  <Suspense fallback={
                    <div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>
                  }>
                    <CareerVersePage />
                  </Suspense>
                } />
                <Route path="/careerverse" element={
                  <Suspense fallback={
                    <div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>
                  }>
                    <CareerVersePage />
                  </Suspense>
                } />
                <Route path="/rpg" element={
                  <Suspense fallback={
                    <div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>
                  }>
                    <CareerVersePage />
                  </Suspense>
                } />`;

if (!app.includes('path="/play"') && app.includes(targetPriority)) {
  app = app.replace(targetPriority, priorityRoutes);
}

fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('App.tsx patched successfully');

// 2. Patch src/components/profile/UniversalProfileRouteHandler.tsx
let up = fs.readFileSync('src/components/profile/UniversalProfileRouteHandler.tsx', 'utf8');

if (!up.includes("'play', 'careerverse', 'rpg'")) {
  up = up.replace("'career-os', 'talent-score', 'gamification', 'txc', 't', 'p',", "'career-os', 'talent-score', 'gamification', 'play', 'careerverse', 'rpg', 'txc', 't', 'p',");
}

const cleanTarget = 'const lowerClean = cleanUsername.toLowerCase();';
const cleanReplacement = `const lowerClean = cleanUsername.toLowerCase();

  // If hitting CareerVerse / RPG directly, route to CareerVerse
  if (lowerClean === 'play' || lowerClean === 'careerverse' || lowerClean === 'rpg') {
    return <Navigate to={'/' + lowerClean} replace />;
  }`;

if (!up.includes("// If hitting CareerVerse") && up.includes(cleanTarget)) {
  up = up.replace(cleanTarget, cleanReplacement);
}

fs.writeFileSync('src/components/profile/UniversalProfileRouteHandler.tsx', up, 'utf8');
console.log('UniversalProfileRouteHandler.tsx patched successfully');

// 3. Patch src/navigation/gamificationRoutes.tsx
let gr = fs.readFileSync('src/navigation/gamificationRoutes.tsx', 'utf8');
if (!gr.includes('to: "/play"')) {
  const grTarget = 'export const gamificationRoutes: NavItem[] = [';
  const grReplacement = `const CareerVersePage = lazy(() => import('../pages/CareerVersePage'));

export const gamificationRoutes: NavItem[] = [
  {
    title: "CareerVerse RPG",
    to: "/play",
    icon: <Gamepad2 className="h-4 w-4 text-[#36D9F5]" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career RPG",
    to: "/careerverse",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career RPG",
    to: "/rpg",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },`;
  gr = gr.replace(grTarget, grReplacement);
  if (!gr.includes('Gamepad2')) {
    gr = gr.replace('import { Trophy', 'import { Trophy, Gamepad2');
  }
  fs.writeFileSync('src/navigation/gamificationRoutes.tsx', gr, 'utf8');
  console.log('gamificationRoutes.tsx patched successfully');
}
