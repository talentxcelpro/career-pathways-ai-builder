
import React from 'react';
import { RouterProvider } from '@/components/routing/RouterProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CurrencyProvider>
          <RouterProvider />
          <Toaster />
        </CurrencyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
