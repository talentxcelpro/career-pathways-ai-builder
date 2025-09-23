import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'

import './index.css'
import './utils/turboCore'

// Log React version for debugging
console.log('React version:', React.version);

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <AppWrapper />
);
