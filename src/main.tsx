import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ReactDispatcherRecovery } from './components/recovery/ReactDispatcherRecovery'
import { EnhancedReactInitializer } from './components/recovery/EnhancedReactInitializer'

import './index.css'

// Enhanced React initialization with dispatcher recovery
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Ensure React is properly initialized
console.log('🚀 Starting React application with dispatcher recovery...');

const root = createRoot(container);

// Wrap App with enhanced recovery components to handle dispatcher issues
root.render(
  <ReactDispatcherRecovery maxRetries={5}>
    <EnhancedReactInitializer
      maxRetries={5}
      retryDelay={1000}
      onInitialized={() => console.log('✅ React context initialized successfully')}
    >
      <App />
    </EnhancedReactInitializer>
  </ReactDispatcherRecovery>
);
