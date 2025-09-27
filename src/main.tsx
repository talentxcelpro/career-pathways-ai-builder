import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async'
import { SafeReactComponent } from './components/SafeReactComponent'

import './index.css'

// Ensure React dispatcher is properly initialized
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// Wrap in SafeReactComponent to ensure dispatcher is available
root.render(
  <SafeReactComponent fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Initializing...</div>}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </SafeReactComponent>
);
