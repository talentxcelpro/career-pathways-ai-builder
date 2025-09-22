import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'

import './index.css'
import './utils/turboCore'

// Ensure React is globally available and properly initialized
if (typeof window !== 'undefined') {
  (window as any).React = React;
  console.log('React version:', React.version);
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <AppWrapper />
);
