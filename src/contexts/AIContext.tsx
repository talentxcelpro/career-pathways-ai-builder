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
  const [state, setState] = useState<AIContextState>({
    currentModule: 'general',
    userProfile: null,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conversationHistory: [],
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

    setState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, newMessage]
    }));
  };

  const clearHistory = () => {
    setState(prev => ({ ...prev, conversationHistory: [] }));
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

  const value: AIContextValue = {
    ...state,
    updateModule,
    addMessage,
    clearHistory,
    setUserProfile,
    setLoading,
    setError
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