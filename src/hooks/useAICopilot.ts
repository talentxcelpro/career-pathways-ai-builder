import { useState, useCallback } from 'react';

export interface CopilotState {
  isOpen: boolean;
  isMinimized: boolean;
  context: string;
}

export const useAICopilot = () => {
  const [copilotState, setCopilotState] = useState<CopilotState>({
    isOpen: false,
    isMinimized: false,
    context: 'dashboard'
  });

  const openCopilot = useCallback((context: string = 'dashboard') => {
    setCopilotState({
      isOpen: true,
      isMinimized: false,
      context
    });
  }, []);

  const closeCopilot = useCallback(() => {
    setCopilotState(prev => ({
      ...prev,
      isOpen: false,
      isMinimized: false
    }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setCopilotState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }));
  }, []);

  const setContext = useCallback((context: string) => {
    setCopilotState(prev => ({
      ...prev,
      context
    }));
  }, []);

  return {
    copilotState,
    openCopilot,
    closeCopilot,
    toggleMinimize,
    setContext
  };
};