import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface EnhancedConnectionSuggestion {
  id: string;
  full_name: string;
  title?: string;
  profile_picture_url?: string;
  location?: string;
  company?: string;
  skills?: string[];
  career_goals?: string[];
  career_interests?: string[];
  career_stage?: string;
  industry?: string;
  matchScore: number;
  matchReasons: string[];
  suggestionType: 'skill_match' | 'location_match' | 'industry_match' | 'title_match' | 'random';
}

export const useEnhancedConnectionSuggestions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user profile for matching
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Generate enhanced connection suggestions
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['enhanced-connection-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id || !currentUserProfile) return [];

      console.log('Generating enhanced connection suggestions for:', currentUserProfile);

      // Get existing connections to exclude
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const connectedUserIds = new Set(
        existingConnections?.flatMap(conn => 
          [conn.requester_id, conn.recipient_id]
        ).filter(id => id !== user.id) || []
      );

      // Fetch potential matches
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('full_name', 'is', null)
        .limit(100);

      if (error) throw error;

      const suggestions: EnhancedConnectionSuggestion[] = profiles
        ?.filter(profile => !connectedUserIds.has(profile.id))
        .map(profile => {
          const matchData = calculateMatchScore(currentUserProfile, profile);
          return {
            ...profile,
            ...matchData
          };
        })
        .filter(suggestion => suggestion.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20) || [];

      console.log('Generated suggestions:', suggestions.length);
      return suggestions;
    },
    enabled: !!user?.id && !!currentUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const calculateMatchScore = (currentUser: any, targetUser: any) => {
    let score = 0;
    const reasons: string[] = [];
    let suggestionType: EnhancedConnectionSuggestion['suggestionType'] = 'random';

    // Title similarity (high weight)
    if (currentUser.title && targetUser.title) {
      const titleSimilarity = calculateTextSimilarity(currentUser.title, targetUser.title);
      if (titleSimilarity > 0.3) {
        score += Math.floor(titleSimilarity * 40);
        reasons.push('Similar job title');
        suggestionType = 'title_match';
      }
    }

    // Company similarity
    if (currentUser.company && targetUser.company) {
      if (currentUser.company.toLowerCase() === targetUser.company.toLowerCase()) {
        score += 30;
        reasons.push('Same company');
      }
    }

    // Location proximity
    if (currentUser.location && targetUser.location) {
      const locationSimilarity = calculateTextSimilarity(currentUser.location, targetUser.location);
      if (locationSimilarity > 0.5) {
        score += 20;
        reasons.push('Same location');
        if (suggestionType === 'random') suggestionType = 'location_match';
      }
    }

    // Industry match
    if (currentUser.industry && targetUser.industry) {
      if (currentUser.industry.toLowerCase() === targetUser.industry.toLowerCase()) {
        score += 25;
        reasons.push('Same industry');
        if (suggestionType === 'random') suggestionType = 'industry_match';
      }
    }

    // Skills overlap
    if (currentUser.skills && targetUser.skills) {
      const skillOverlap = currentUser.skills.filter((skill: string) =>
        targetUser.skills.some((targetSkill: string) =>
          skill.toLowerCase().includes(targetSkill.toLowerCase()) ||
          targetSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (skillOverlap.length > 0) {
        score += skillOverlap.length * 10;
        reasons.push(`${skillOverlap.length} shared skills`);
        if (suggestionType === 'random') suggestionType = 'skill_match';
      }
    }

    // Career goals overlap
    if (currentUser.career_goals && targetUser.career_goals) {
      const goalOverlap = currentUser.career_goals.filter((goal: string) =>
        targetUser.career_goals.includes(goal)
      );
      if (goalOverlap.length > 0) {
        score += goalOverlap.length * 15;
        reasons.push(`${goalOverlap.length} shared career goals`);
      }
    }

    // Career interests overlap
    if (currentUser.career_interests && targetUser.career_interests) {
      const interestOverlap = currentUser.career_interests.filter((interest: string) =>
        targetUser.career_interests.includes(interest)
      );
      if (interestOverlap.length > 0) {
        score += interestOverlap.length * 12;
        reasons.push(`${interestOverlap.length} shared interests`);
      }
    }

    // Base score for having complete profiles
    if (targetUser.full_name && targetUser.title) {
      score += 5;
    }

    // Random factor for discovery
    if (score === 0 && Math.random() > 0.7) {
      score = Math.floor(Math.random() * 15) + 5;
      reasons.push('Discover new connections');
    }

    return {
      matchScore: Math.min(score, 100),
      matchReasons: reasons,
      suggestionType
    };
  };

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(' ').filter(w => w.length > 2);
    const words2 = text2.toLowerCase().split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => 
      words2.some(w2 => w2.includes(word) || word.includes(w2))
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  // Send connection request
  const sendConnectionMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${user.id})`)
        .single();

      if (existing) {
        throw new Error('Connection already exists');
      }

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-connection-suggestions'] });
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

  // Generate more suggestions (refresh)
  const refreshSuggestions = () => {
    queryClient.invalidateQueries({ queryKey: ['enhanced-connection-suggestions'] });
  };

  return {
    suggestions,
    isLoading,
    error,
    sendConnection: sendConnectionMutation.mutate,
    isSendingConnection: sendConnectionMutation.isPending,
    refreshSuggestions,
    currentUserProfile
  };
};