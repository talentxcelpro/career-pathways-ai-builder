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
  try {
    const context = useContext(CopilotContext);
    if (!context) {
      console.warn('useCopilotContext called outside provider, returning fallback');
      // Return safe fallback instead of throwing
      return {
        copilotState: {
          isOpen: false,
          isMinimized: false,
          context: 'dashboard'
        },
        openCopilot: () => {},
        closeCopilot: () => {},
        toggleMinimize: () => {},
        setContext: () => {}
      };
    }
    return context;
  } catch (error) {
    console.error('useCopilotContext error:', error);
    // Return safe fallback
    return {
      copilotState: {
        isOpen: false,
        isMinimized: false,
        context: 'dashboard'
      },
      openCopilot: () => {},
      closeCopilot: () => {},
      toggleMinimize: () => {},
      setContext: () => {}
    };
  }
};

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  try {
    const copilotHook = useAICopilot();

    return (
      <CopilotContext.Provider value={copilotHook}>
        {children}
        {copilotHook.copilotState.isOpen && (
          <AICareerCopilot />
        )}
      </CopilotContext.Provider>
    );
  } catch (error) {
    console.error('CopilotProvider error:', error);
    // Return children without copilot functionality
    return <>{children}</>;
  }
}