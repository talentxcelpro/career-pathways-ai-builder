import React from 'react'
import { createRoot } from 'react-dom/client'

// Critical CSS import
import './index.css'

// Performance optimizations
import { initInstantLoader } from '@/utils/instantLoader'

// Initialize instant loader immediately
initInstantLoader();

// Lazy load the main App component for better performance
const App = React.lazy(() => import('./App.tsx'));

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Performance-optimized loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading TalentXcel...</p>
    </div>
  </div>
);

const root = createRoot(container);

// Start application with Suspense for instant loading
root.render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingFallback />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
