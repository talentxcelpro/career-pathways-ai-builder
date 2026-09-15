import React, { useState, useCallback } from 'react';

export interface CopilotState {
  isOpen: boolean;
  isMinimized: boolean;
  context: string;
}

// Safe hook wrapper that handles React dispatcher issues
export const useAICopilot = () => {
  // Check if React hooks are available before using them
  if (typeof React === 'undefined' || !React.useState) {
    console.warn('React hooks not available, returning fallback state');
    return {
      copilotState: {
        isOpen: false,
        isMinimized: false,
        context: 'dashboard'
      },
      openCopilot: () => console.warn('openCopilot not available'),
      closeCopilot: () => console.warn('closeCopilot not available'),
      toggleMinimize: () => console.warn('toggleMinimize not available'),
      setContext: () => console.warn('setContext not available')
    };
  }

  try {
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
  } catch (error) {
    console.error('useAICopilot error:', error);
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