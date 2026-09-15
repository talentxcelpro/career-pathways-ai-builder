import React, { createContext, useContext, ReactNode } from 'react';
import { usePrefillData, PrefillOptions } from '@/hooks/usePrefillData';
import { useUltraFastRefresh } from '@/hooks/useUltraFastRefresh';
import { useAuth } from '@/contexts/AuthContext';

interface PrefillContextType {
  getPrefill: (options: PrefillOptions) => any;
  refreshModule: (module: string) => void;
  isGloballyLoading: boolean;
  performanceMetrics: {
    avgLatency: number;
    updateCount: number;
  };
}

const PrefillContext = createContext<PrefillContextType | undefined>(undefined);

export function usePrefillContext() {
  const context = useContext(PrefillContext);
  if (!context) {
    throw new Error('usePrefillContext must be used within a PrefillProvider');
  }
  return context;
}

interface PrefillProviderProps {
  children: ReactNode;
  enableUltraFast?: boolean;
}

export function PrefillProvider({ children, enableUltraFast = true }: PrefillProviderProps) {
  const { user } = useAuth();
  
  // Ultra-fast refresh for real-time updates
  const ultraFastRefresh = useUltraFastRefresh(null, {
    module: 'global',
    tables: ['jobs', 'posts', 'profiles', 'connections'],
    enabled: enableUltraFast && !!user,
    maxBatchTime: 1, // 1ms batching for ultra-fast updates
    batchSize: 5,
  });

  const getPrefill = (options: PrefillOptions) => {
    // This would typically use a cache or state management
    // For now, consumers will use usePrefillData directly
    return null;
  };

  const refreshModule = (module: string) => {
    // Trigger refresh for specific module
    console.log(`Refreshing module: ${module}`);
  };

  const value: PrefillContextType = {
    getPrefill,
    refreshModule,
    isGloballyLoading: false,
    performanceMetrics: ultraFastRefresh.performance,
  };

  return (
    <PrefillContext.Provider value={value}>
      {children}
    </PrefillContext.Provider>
  );
}