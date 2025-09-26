import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIServiceMatch {
  id: string;
  user_id: string;
  service_type: string;
  query: string;
  response: string;
  confidence_score: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  service_type: string;
  title: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export const useAIServiceMatching = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's AI service matches
  const {
    data: matches,
    isLoading: matchesLoading,
    error: matchesError
  } = useQuery({
    queryKey: ['aiServiceMatches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_service_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIServiceMatch[];
    }
  });

  // Fetch user's conversations
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as ChatConversation[];
    }
  });

  // Fetch messages for a specific conversation
  const useConversationMessages = (conversationId: string) => {
    return useQuery({
      queryKey: ['chatMessages', conversationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ChatMessage[];
      },
      enabled: !!conversationId
    });
  };

  // Get AI response mutation
  const getAIResponseMutation = useMutation({
    mutationFn: async ({
      message,
      serviceType,
      conversationId
    }: {
      message: string;
      serviceType: string;
      conversationId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-service-matching', {
        body: { message, serviceType, conversationId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['aiServiceMatches'] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      console.error('AI response error:', error);
    }
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      // First delete messages
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete conversation
      const { error: conversationError } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      toast({
        title: "Success",
        description: "Conversation deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive"
      });
      console.error('Delete conversation error:', error);
    }
  });

  // Update conversation title mutation
  const updateConversationMutation = useMutation({
    mutationFn: async ({
      conversationId,
      title
    }: {
      conversationId: string;
      title: string;
    }) => {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
      toast({
        title: "Success",
        description: "Conversation title updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update conversation title.",
        variant: "destructive"
      });
      console.error('Update conversation error:', error);
    }
  });

  return {
    // Data
    matches,
    conversations,
    
    // Loading states
    matchesLoading,
    conversationsLoading,
    
    // Errors
    matchesError,
    conversationsError,
    
    // Mutations
    getAIResponse: getAIResponseMutation.mutate,
    isGettingResponse: getAIResponseMutation.isPending,
    
    deleteConversation: deleteConversationMutation.mutate,
    isDeletingConversation: deleteConversationMutation.isPending,
    
    updateConversation: updateConversationMutation.mutate,
    isUpdatingConversation: updateConversationMutation.isPending,
    
    // Hooks
    useConversationMessages
  };
};