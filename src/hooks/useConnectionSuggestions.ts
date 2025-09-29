import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// TEMPORARILY DISABLED TXC - import { useTXCMining } from './useTXCMining';
// TEMPORARILY DISABLED TXC - import { useTokenBalance } from './useTokenBalance';

export interface ConnectionSuggestion {
  id: string;
  user_id: string;
  suggested_user_id: string;
  suggestion_type: 'skills_match' | 'company_match' | 'education_match' | 'mutual_connections';
  confidence_score: number;
  is_dismissed: boolean;
  created_at: string;
  // Joined data
  suggested_user?: {
    id: string;
    full_name: string;
    headline: string;
    profile_photo_url?: string;
    location?: string;
    company?: string;
  };
}

export const useConnectionSuggestions = () => {
  const queryClient = useQueryClient();
  // TEMPORARILY DISABLED TXC - const { earnTXC } = useTXCMining();
  // TEMPORARILY DISABLED TXC - const { refreshBalance } = useTokenBalance();

  // Fetch connection suggestions
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['connection-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('connection_suggestions')
        .select(`
          *,
          suggested_user:profiles!connection_suggestions_suggested_user_id_fkey(
            id,
            full_name,
            headline,
            profile_photo_url,
            location
          )
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('confidence_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ConnectionSuggestion[];
    },
    retry: 1
  });

  // Send connection request mutation
  const sendConnectionMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${user.id})`)
        .single();

      if (existing) {
        throw new Error('Connection already exists');
      }

      // Create connection request
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: targetUserId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Dismiss the suggestion
      await supabase
        .from('connection_suggestions')
        .update({ is_dismissed: true })
        .eq('user_id', user.id)
        .eq('suggested_user_id', targetUserId);

      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      
      // TEMPORARILY DISABLED TXC
      // const earned = await earnTXC('connection_made');
      // console.log('TXC earned for connection:', earned);
      toast.success('Connection request sent!');
    },
    onError: (error: any) => {
      if (error.message.includes('already exists')) {
        toast.error('Connection already exists');
      } else {
        toast.error('Failed to send connection request');
      }
    }
  });

  // Dismiss suggestion mutation
  const dismissSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('connection_suggestions')
        .update({ is_dismissed: true })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
    },
    onError: (error) => {
      console.error('Error dismissing suggestion:', error);
      toast.error('Failed to dismiss suggestion');
    }
  });

  // Generate suggestions (call AI/backend)
  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // This would typically call an AI service to generate suggestions
      // For now, we'll create some mock suggestions based on profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, headline, location')
        .neq('id', user.id)
        .limit(10);

      if (!profiles || profiles.length === 0) return;

      const suggestions = profiles.map(profile => ({
        user_id: user.id,
        suggested_user_id: profile.id,
        suggestion_type: 'skills_match' as const,
        confidence_score: Math.random() * 0.5 + 0.5, // Random score between 0.5-1
        is_dismissed: false
      }));

      const { error } = await supabase
        .from('connection_suggestions')
        .upsert(suggestions, {
          onConflict: 'user_id,suggested_user_id',
          ignoreDuplicates: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
      toast.success('New connection suggestions generated!');
    },
    onError: (error) => {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    }
  });

  return {
    suggestions,
    isLoading,
    error,
    sendConnection: sendConnectionMutation.mutate,
    dismissSuggestion: dismissSuggestionMutation.mutate,
    generateSuggestions: generateSuggestionsMutation.mutate,
    isSendingConnection: sendConnectionMutation.isPending,
    isDismissing: dismissSuggestionMutation.isPending,
    isGenerating: generateSuggestionsMutation.isPending
  };
};