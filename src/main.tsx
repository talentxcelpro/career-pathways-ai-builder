import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import './index.css'

// Minimal React initialization to fix dispatcher issues
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// Direct render without any wrappers that might interfere with React's dispatcher
root.render(<App />);
