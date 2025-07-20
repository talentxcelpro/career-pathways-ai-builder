
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAI } from '@/contexts/AIContext';

export interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  module?: string;
  metadata?: any;
}

export interface AIModule {
  key: string;
  name: string;
  description: string;
  icon: string;
  prompts: string[];
}

export const AI_MODULES: AIModule[] = [
  {
    key: 'network',
    name: 'Network AI',
    description: 'Build connections, grow influence, join communities',
    icon: '🔗',
    prompts: [
      "Who are 5 professionals I should connect with in my field?",
      "Write a smart connection message for a recruiter.",
      "Show trending communities for my industry.",
      "Analyze my influence score and how to improve it."
    ]
  },
  {
    key: 'jobs',
    name: 'Jobs AI', 
    description: 'Smart job discovery, application assistance, and match-making',
    icon: '💼',
    prompts: [
      "Find jobs matching my profile in my preferred location.",
      "Analyze this job description and tell how I can tailor my resume.",
      "Prepare me for an interview for this job.",
      "What's the average salary for my target role?"
    ]
  },
  {
    key: 'employer',
    name: 'Employer AI',
    description: 'Empower hiring, branding, and employer intelligence',
    icon: '🏢',
    prompts: [
      "Write a job post for a specific role and requirements.",
      "Rank job applicants based on job description fit.",
      "Create interview questions for a specific role.",
      "What's the ideal employer branding strategy?"
    ]
  },
  {
    key: 'companies',
    name: 'Companies AI',
    description: 'Discover, analyze, and benchmark companies',
    icon: '🏬',
    prompts: [
      "Summarize a company's profile and culture.",
      "Compare two companies on job satisfaction and pay.",
      "What's the hiring trend in a specific company?"
    ]
  },
  {
    key: 'resume',
    name: 'Resume Builder AI',
    description: 'Create, enhance, tailor, and structure resumes',
    icon: '📄',
    prompts: [
      "Enhance this resume section for a specific role.",
      "Create a resume for my background and target field.",
      "Analyze and optimize my resume for ATS.",
      "Convert my experience into a structured resume format."
    ]
  },
  {
    key: 'tools',
    name: 'Tools AI',
    description: 'Access all career tools with AI guidance',
    icon: '🛠️',
    prompts: [
      "Run a career SWOT analysis for me.",
      "What career roles suit my background?",
      "Run a resume checker for ATS compliance.",
      "Simulate an interview for a specific role."
    ]
  },
  {
    key: 'services',
    name: 'Services AI',
    description: 'Book or recommend services: Resume writing, mentoring, career coaching',
    icon: '🧳',
    prompts: [
      "Suggest a mentor for my career switch.",
      "Book a resume writing service.",
      "Who are the top-rated career coaches?"
    ]
  },
  {
    key: 'learning',
    name: 'Learning AI',
    description: 'Smart learning paths, course recommender, certification guidance',
    icon: '🎓',
    prompts: [
      "Create a learning roadmap for my target role.",
      "Recommend top courses for a specific skill.",
      "What skills am I missing for my career goals?",
      "What certifications should I pursue?"
    ]
  },
  {
    key: 'colleges',
    name: 'Colleges AI',
    description: 'College search, comparison, admission prep, and alumni trends',
    icon: '🏫',
    prompts: [
      "List top colleges for my target course.",
      "Compare colleges for a specific specialization.",
      "Show top alumni from a college in my field."
    ]
  },
  {
    key: 'career_map',
    name: 'Career Map AI',
    description: 'Build 5-year role-based roadmaps and explore career paths',
    icon: '🗺️',
    prompts: [
      "Show me a 5-year career roadmap for my target role.",
      "What roles can I transition to from my current role?",
      "Evaluate my career fit for a specific role."
    ]
  }
];

export const useTalentXcelAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const { userProfile, currentModule: contextModule } = useAI();

  const sendMessage = useCallback(async (
    message: string,
    module?: string
  ): Promise<AIMessage | null> => {
    setIsProcessing(true);

    try {
      console.log('🤖 Sending message to TalentXcel AI:', { message, module });

      const { data: { user } } = await supabase.auth.getUser();
      
      const requestData = {
        message,
        userId: user?.id,
        module: module || currentModule || contextModule,
        context: {
          currentRoute: window.location.pathname,
          userProfile: userProfile,
          timestamp: new Date().toISOString()
        },
        conversationHistory: messages.slice(-5) // Last 5 messages for context
      };

      const { data, error } = await supabase.functions.invoke('talentxcel-ai-agent', {
        body: requestData
      });

      if (error) {
        console.error('❌ AI Agent error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'AI processing failed');
      }

      // Create user message
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        module: module || currentModule || contextModule
      };

      // Create AI response message
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date().toISOString(),
        module: data.module,
        metadata: {
          tokensUsed: data.tokensUsed,
          responseTime: data.responseTime,
          suggestions: data.suggestions
        }
      };

      // Update messages
      setMessages(prev => [...prev, userMessage, aiMessage]);

      console.log('✅ AI response received:', aiMessage);
      return aiMessage;

    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      toast.error(error.message || 'Failed to get AI response');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [messages, currentModule, contextModule, userProfile]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentModule(null);
  }, []);

  const switchModule = useCallback((moduleKey: string) => {
    setCurrentModule(moduleKey);
  }, []);

  const getQuickPrompts = useCallback((moduleKey?: string) => {
    const module = AI_MODULES.find(m => m.key === (moduleKey || currentModule));
    return module?.prompts || [];
  }, [currentModule]);

  return {
    messages,
    isProcessing,
    currentModule,
    sendMessage,
    clearConversation,
    switchModule,
    getQuickPrompts,
    modules: AI_MODULES
  };
};
