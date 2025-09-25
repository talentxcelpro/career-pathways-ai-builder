import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'

import './index.css'
import './utils/turboCore'

// Log React version for debugging
console.log('React version:', React.version);

// Ensure React is properly initialized
if (!React || !React.createElement || !React.useState) {
  console.error('React is not properly initialized');
  throw new Error('React initialization failed');
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Add additional safety check
try {
  createRoot(container).render(
    <AppWrapper />
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback rendering
  container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading application...</div>';
}
