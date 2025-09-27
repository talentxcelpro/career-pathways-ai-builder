import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { SimpleReactInitializer } from './components/recovery/SimpleReactInitializer'

import './index.css'

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

console.log('🚀 Starting React application...');

const root = createRoot(container);

root.render(
  <SimpleReactInitializer>
    <App />
  </SimpleReactInitializer>
);
