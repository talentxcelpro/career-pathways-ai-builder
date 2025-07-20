import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/contexts/AIContext';

export interface AIAgentConversation {
  id: string;
  user_id: string;
  session_id: string;
  module_name: string;
  conversation_title: string;
  messages: AIAgentMessage[];
  context_data: Record<string, any>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIAgentMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  module_name?: string;
  metadata?: Record<string, any>;
}

export interface AIAgentPrompt {
  id: string;
  module_name: string;
  prompt_title: string;
  prompt_content: string;
  category: string;
  tags: string[];
  complexity_level: 'easy' | 'medium' | 'advanced';
  usage_count: number;
  success_rate: number;
  is_active: boolean;
}

export interface AIAgentRecommendation {
  id: string;
  user_id: string;
  module_name: string;
  recommendation_type: string;
  recommendation_data: Record<string, any>;
  confidence_score: number;
  priority: number;
  is_viewed: boolean;
  is_dismissed: boolean;
  expires_at?: string;
  created_at: string;
}

export const useAIAgent = () => {
  const [currentConversation, setCurrentConversation] = useState<AIAgentConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addMessage } = useAI();

  // Fetch user's conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['aiAgentConversations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ai_agent_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as AIAgentConversation[];
    }
  });

  // Fetch prompts for a specific module
  const fetchPrompts = useCallback(async (moduleName?: string) => {
    const query = (supabase as any)
      .from('ai_agent_prompts')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (moduleName) {
      query.eq('module_name', moduleName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AIAgentPrompt[];
  }, []);

  // Fetch recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['aiAgentRecommendations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ai_agent_recommendations')
        .select('*')
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AIAgentRecommendation[];
    }
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (moduleName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newConversation = {
        user_id: user.id,
        module_name: moduleName,
        conversation_title: `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Conversation`,
        messages: [],
        context_data: { module: moduleName, started_at: new Date().toISOString() }
      };

      const { data, error } = await (supabase as any)
        .from('ai_agent_conversations')
        .insert(newConversation)
        .select()
        .single();

      if (error) throw error;
      return data as AIAgentConversation;
    },
    onSuccess: (newConversation) => {
      setCurrentConversation(newConversation);
      queryClient.invalidateQueries({ queryKey: ['aiAgentConversations'] });
      toast({
        title: "New conversation started",
        description: `Started ${newConversation.module_name} conversation`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      content, 
      moduleName, 
      conversationId 
    }: { 
      content: string; 
      moduleName: string; 
      conversationId?: string;
    }) => {
      setIsLoading(true);

      let conversation = currentConversation;
      
      // Create conversation if none exists
      if (!conversation || conversation.module_name !== moduleName) {
        const newConv = await createConversationMutation.mutateAsync(moduleName);
        conversation = newConv;
      }

      if (!conversation) throw new Error('No conversation available');

      const userMessage: AIAgentMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        content,
        timestamp: new Date().toISOString(),
        module_name: moduleName
      };

      // Add user message to conversation
      const updatedMessages = [...(conversation.messages || []), userMessage];

      // Update conversation in database
      const { error: updateError } = await (supabase as any)
        .from('ai_agent_conversations')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (updateError) throw updateError;

      // Use existing AI service to get response
      try {
        // Add to AI context for cross-module intelligence
        addMessage({
          content,
          type: 'user',
          module: moduleName
        });

        // Simulate AI response for now - in production, this would call the AI service
        const aiResponse: AIAgentMessage = {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: `Based on your ${moduleName} query: "${content}", I'll help you with intelligent insights and recommendations. This is a simulated response - the actual AI integration will provide detailed, contextual assistance for your career needs.`,
          timestamp: new Date().toISOString(),
          module_name: moduleName,
          metadata: {
            model: 'talentxcel-agent',
            confidence: 0.95,
            processing_time: Math.random() * 1000 + 500
          }
        };

        const finalMessages = [...updatedMessages, aiResponse];

        // Update conversation with AI response
        const { data: updatedConversation, error: finalUpdateError } = await (supabase as any)
          .from('ai_agent_conversations')
          .update({ 
            messages: finalMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id)
          .select()
          .single();

        if (finalUpdateError) throw finalUpdateError;

        // Log analytics
        await (supabase as any).from('ai_agent_analytics').insert({
          user_id: conversation.user_id,
          session_id: conversation.session_id,
          module_name: moduleName,
          action_type: 'message_sent',
          action_data: { query: content, response_length: aiResponse.content.length },
          response_time_ms: aiResponse.metadata?.processing_time || 1000,
          success: true
        });

        return updatedConversation as AIAgentConversation;

      } catch (aiError) {
        console.error('AI Service Error:', aiError);
        
        // Fallback response
        const errorResponse: AIAgentMessage = {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: "I'm experiencing some technical difficulties. Please try again in a moment, or contact support if the issue persists.",
          timestamp: new Date().toISOString(),
          module_name: moduleName,
          metadata: { error: true }
        };

        const finalMessages = [...updatedMessages, errorResponse];

        const { data: updatedConversation } = await (supabase as any)
          .from('ai_agent_conversations')
          .update({ 
            messages: finalMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id)
          .select()
          .single();

        return updatedConversation as AIAgentConversation;
      }
    },
    onSuccess: (updatedConversation) => {
      setCurrentConversation(updatedConversation);
      queryClient.invalidateQueries({ queryKey: ['aiAgentConversations'] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Helper functions
  const createConversation = useCallback((moduleName: string) => {
    createConversationMutation.mutate(moduleName);
  }, [createConversationMutation]);

  const sendMessage = useCallback((content: string, moduleName: string, conversationId?: string) => {
    sendMessageMutation.mutate({ content, moduleName, conversationId });
  }, [sendMessageMutation]);

  const switchConversation = useCallback((conversation: AIAgentConversation) => {
    setCurrentConversation(conversation);
  }, []);

  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await (supabase as any)
        .from('ai_agent_conversations')
        .update({ is_archived: true })
        .eq('id', conversationId);

      queryClient.invalidateQueries({ queryKey: ['aiAgentConversations'] });
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      toast({
        title: "Conversation archived",
        description: "The conversation has been archived successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive",
      });
    }
  }, [currentConversation, queryClient, toast]);

  return {
    conversations,
    currentConversation,
    recommendations,
    isLoading: isLoading || sendMessageMutation.isPending,
    fetchPrompts,
    createConversation,
    sendMessage,
    switchConversation,
    archiveConversation,
    refetchConversations
  };
};