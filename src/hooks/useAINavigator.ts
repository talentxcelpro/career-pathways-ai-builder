import React, { useState, useCallback } from 'react';

export interface NavigatorState {
  isOpen: boolean;
  isMinimized: boolean;
  context: string;
}

// Safe hook wrapper that handles React dispatcher issues
export const useAINavigator = () => {
  // Check if React hooks are available before using them
  if (typeof React === 'undefined' || !React.useState) {
    console.warn('React hooks not available, returning fallback state');
    return {
      NavigatorState: {
        isOpen: false,
        isMinimized: false,
        context: 'CommandCenter'
      },
      openNavigator: () => console.warn('openNavigator not available'),
      closeNavigator: () => console.warn('closeNavigator not available'),
      toggleMinimize: () => console.warn('toggleMinimize not available'),
      setContext: () => console.warn('setContext not available')
    };
  }

  try {
    const [NavigatorState, setNavigatorState] = useState<NavigatorState>({
      isOpen: false,
      isMinimized: false,
      context: 'CommandCenter'
    });

    const openNavigator = useCallback((context: string = 'CommandCenter') => {
      setNavigatorState({
        isOpen: true,
        isMinimized: false,
        context
      });
    }, []);

    const closeNavigator = useCallback(() => {
      setNavigatorState(prev => ({
        ...prev,
        isOpen: false,
        isMinimized: false
      }));
    }, []);

    const toggleMinimize = useCallback(() => {
      setNavigatorState(prev => ({
        ...prev,
        isMinimized: !prev.isMinimized
      }));
    }, []);

    const setContext = useCallback((context: string) => {
      setNavigatorState(prev => ({
        ...prev,
        context
      }));
    }, []);

    return {
      NavigatorState,
      openNavigator,
      closeNavigator,
      toggleMinimize,
      setContext
    };
  } catch (error) {
    console.error('useAINavigator error:', error);
    // Return safe fallback
    return {
      NavigatorState: {
        isOpen: false,
        isMinimized: false,
        context: 'CommandCenter'
      },
      openNavigator: () => {},
      closeNavigator: () => {},
      toggleMinimize: () => {},
      setContext: () => {}
    };
  }
};


