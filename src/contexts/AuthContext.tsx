// Temporary minimal auth context to bypass React dispatcher issues
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Temporary static values to bypass React dispatcher issues
  const user = null;
  const session = null;
  const loading = false;

  const signOut = async () => {
    // Temporary no-op
    console.log('signOut called - temporarily disabled');
  };

  const refreshSession = async () => {
    // Temporary no-op
    console.log('refreshSession called - temporarily disabled');
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};