import React from 'react'
import { createRoot } from 'react-dom/client'
import MinimalApp from './App.minimal.tsx'

import './index.css'

console.log('🎯 MAIN: Starting app initialization');

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

console.log('🎯 MAIN: Rendering minimal app');
root.render(<MinimalApp />);
