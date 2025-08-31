import React, { createContext, useContext, ReactNode } from 'react';
import { useSecureSession } from '@/hooks/useSecureSession';

interface SecureSessionContextType {
  session: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const SecureSessionContext = createContext<SecureSessionContextType | undefined>(undefined);

export const useSecureSessionContext = () => {
  const context = useContext(SecureSessionContext);
  if (context === undefined) {
    throw new Error('useSecureSessionContext must be used within a SecureSessionProvider');
  }
  return context;
};

interface SecureSessionProviderProps {
  children: ReactNode;
}

export const SecureSessionProvider: React.FC<SecureSessionProviderProps> = ({ children }) => {
  const sessionData = useSecureSession();

  return (
    <SecureSessionContext.Provider value={sessionData}>
      {children}
    </SecureSessionContext.Provider>
  );
};