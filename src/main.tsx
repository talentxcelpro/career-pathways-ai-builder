import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ReactDispatcherRecovery } from './components/recovery/ReactDispatcherRecovery'
import { ReactInitializer } from './components/recovery/ReactInitializer'

import './index.css'

// Enhanced React initialization with dispatcher recovery
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Ensure React is properly initialized
console.log('🚀 Starting React application with dispatcher recovery...');

const root = createRoot(container);

// Wrap App with recovery components to handle dispatcher issues
root.render(
  <ReactDispatcherRecovery maxRetries={3}>
    <ReactInitializer
      onInitialized={() => console.log('✅ React context initialized successfully')}
    >
      <App />
    </ReactInitializer>
  </ReactDispatcherRecovery>
);
