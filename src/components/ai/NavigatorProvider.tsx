import React, { createContext, useContext } from 'react';
import { useAINavigator, NavigatorState } from '@/hooks/useAINavigator';
import { TalentXcelNavigatorWidget as AICareerNavigator } from './AICareerNavigator';

interface NavigatorContextType {
  NavigatorState: NavigatorState;
  openNavigator: (context?: string) => void;
  closeNavigator: () => void;
  toggleMinimize: () => void;
  setContext: (context: string) => void;
}

const NavigatorContext = createContext<NavigatorContextType | undefined>(undefined);

export const useNavigatorContext = () => {
  try {
    const context = useContext(NavigatorContext);
    if (!context) {
      console.warn('useNavigatorContext called outside provider, returning fallback');
      // Return safe fallback instead of throwing
      return {
        NavigatorState: {
          isOpen: false,
          isMinimized: false,
          context: 'command-center'
        },
        openNavigator: () => {},
        closeNavigator: () => {},
        toggleMinimize: () => {},
        setContext: () => {}
      };
    }
    return context;
  } catch (error) {
    console.error('useNavigatorContext error:', error);
    // Return safe fallback
    return {
      NavigatorState: {
        isOpen: false,
        isMinimized: false,
        context: 'command-center'
      },
      openNavigator: () => {},
      closeNavigator: () => {},
      toggleMinimize: () => {},
      setContext: () => {}
    };
  }
};

export function NavigatorProvider({ children }: { children: React.ReactNode }) {
  try {
    const NavigatorHook = useAINavigator();

    return (
      <NavigatorContext.Provider value={NavigatorHook}>
        {children}
        {NavigatorHook.NavigatorState.isOpen && (
          <AICareerNavigator />
        )}
      </NavigatorContext.Provider>
    );
  } catch (error) {
    console.error('NavigatorProvider error:', error);
    // Return children without Navigator functionality
    return <>{children}</>;
  }
}


