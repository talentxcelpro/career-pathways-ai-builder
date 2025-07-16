import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name?: string;
  title?: string;
  user_role?: string;
  skills?: string[];
  experience_years?: number;
  location?: string;
  preferences?: any;
}

interface AIContextState {
  currentModule: string;
  userProfile: UserProfile | null;
  sessionId: string;
  conversationHistory: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  module: string;
  timestamp: string;
  metadata?: any;
}

interface AIContextValue extends AIContextState {
  updateModule: (module: string) => void;
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

const moduleMap: Record<string, string> = {
  '/network': 'network',
  '/jobs': 'jobs',
  '/employer': 'employer',
  '/companies': 'companies',
  '/resume': 'resume_builder',
  '/tools': 'tools',
  '/services': 'services',
  '/learning': 'learning',
  '/colleges': 'colleges',
  '/career-map': 'career_map',
  '/ai-assistant': 'ai_assistant',
  '/ai-career': 'ai_career'
};

function getModuleFromPath(pathname: string): string {
  // Find exact match first
  if (moduleMap[pathname]) {
    return moduleMap[pathname];
  }
  
  // Find partial match
  for (const [path, module] of Object.entries(moduleMap)) {
    if (pathname.startsWith(path)) {
      return module;
    }
  }
  
  return 'general';
}

export function AIProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  
  // Load conversation history from localStorage
  const loadConversationHistory = (): ConversationMessage[] => {
    try {
      const saved = localStorage.getItem('ai_conversation');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [state, setState] = useState<AIContextState>({
    currentModule: 'general',
    userProfile: null,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conversationHistory: loadConversationHistory(),
    isLoading: false,
    error: null
  });

  // Update module based on current route
  useEffect(() => {
    const module = getModuleFromPath(location.pathname);
    setState(prev => ({ ...prev, currentModule: module }));
  }, [location.pathname]);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile as UserProfile);
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const updateModule = (module: string) => {
    setState(prev => ({ ...prev, currentModule: module }));
  };

  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setState(prev => {
      const updatedHistory = [...prev.conversationHistory, newMessage];
      // Save to localStorage
      try {
        localStorage.setItem('ai_conversation', JSON.stringify(updatedHistory));
      } catch (error) {
        console.warn('Failed to save conversation to localStorage:', error);
      }
      return {
        ...prev,
        conversationHistory: updatedHistory
      };
    });
  };

  const clearHistory = () => {
    setState(prev => ({ ...prev, conversationHistory: [] }));
    // Clear from localStorage
    try {
      localStorage.removeItem('ai_conversation');
    } catch (error) {
      console.warn('Failed to clear conversation from localStorage:', error);
    }
  };

  const setUserProfile = (profile: UserProfile | null) => {
    setState(prev => ({ ...prev, userProfile: profile }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Auto-clear errors after 10 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  const value: AIContextValue = {
    ...state,
    updateModule,
    addMessage,
    clearHistory,
    setUserProfile,
    setLoading,
    setError,
    clearError
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}