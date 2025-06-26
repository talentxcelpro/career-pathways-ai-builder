
import React from 'react';
import { RouterProvider } from '@/components/routing/RouterProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <RouterProvider />
        <Toaster />
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
