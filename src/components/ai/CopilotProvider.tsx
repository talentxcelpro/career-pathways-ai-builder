import React, { createContext, useContext } from 'react';
import { useAICopilot, CopilotState } from '@/hooks/useAICopilot';
import { AICareerCopilot } from './AICareerCopilot';

interface CopilotContextType {
  copilotState: CopilotState;
  openCopilot: (context?: string) => void;
  closeCopilot: () => void;
  toggleMinimize: () => void;
  setContext: (context: string) => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const useCopilotContext = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilotContext must be used within CopilotProvider');
  }
  return context;
};

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  const copilotHook = useAICopilot();

  return (
    <CopilotContext.Provider value={copilotHook}>
      {children}
      {copilotHook.copilotState.isOpen && (
        <AICareerCopilot />
      )}
    </CopilotContext.Provider>
  );
}