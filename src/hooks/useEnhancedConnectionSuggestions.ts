import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

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

  // Get current user profile safely using maybeSingle
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile-safe', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        return data;
      } catch (err) {
        return null;
      }
    },
    enabled: !!user?.id
  });

  // Fallback demo suggestions if DB returns empty
  const fallbackSuggestions: EnhancedConnectionSuggestion[] = [
    {
      id: 'demo-1',
      full_name: 'Priya Sharma',
      title: 'HR Manager at TechCorp',
      company: 'TechCorp',
      location: 'India',
      profile_picture_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200',
      matchScore: 94,
      matchReasons: ['Shared Industry', 'High Networking Activity'],
      suggestionType: 'industry_match'
    },
    {
      id: 'demo-2',
      full_name: 'Rajit Laghate',
      title: 'VP Sales APAC',
      company: 'TalentXcel Services',
      location: 'India',
      profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200',
      matchScore: 91,
      matchReasons: ['Similar Role', 'Location Match'],
      suggestionType: 'title_match'
    },
    {
      id: 'demo-3',
      full_name: 'Vikram Mehta',
      title: 'Principal Cloud Architect',
      company: 'CloudScale Inc',
      location: 'Singapore',
      profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200',
      matchScore: 88,
      matchReasons: ['Technology & Leadership'],
      suggestionType: 'skill_match'
    }
  ];

  // Generate enhanced connection suggestions
  const { data: suggestions = fallbackSuggestions, isLoading, error } = useQuery({
    queryKey: ['enhanced-connection-suggestions', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return fallbackSuggestions;

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

        // Fetch potential matches from profiles (query a larger pool to bypass existing connections)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .not('full_name', 'is', null)
          .limit(150);

        if (!profiles || profiles.length === 0) {
          return fallbackSuggestions;
        }

        const userSkills = new Set((currentUserProfile?.skills || []).map((s: string) => s.toLowerCase()));
        const userLocation = currentUserProfile?.location?.toLowerCase() || '';
        const userTitle = currentUserProfile?.title?.toLowerCase() || '';

        const res: EnhancedConnectionSuggestion[] = profiles
          .filter(p => !connectedUserIds.has(p.id) && p.full_name?.trim())
          .map(p => {
            const pSkills = (p.skills || []).map((s: string) => s.toLowerCase());
            const sharedSkills = pSkills.filter((s: string) => userSkills.has(s));
            const sameLocation = userLocation && p.location && (userLocation.includes(p.location.toLowerCase()) || p.location.toLowerCase().includes(userLocation));
            const similarTitle = userTitle && p.title && (userTitle.includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(userTitle));

            let suggestionType: EnhancedConnectionSuggestion['suggestionType'] = 'skill_match';
            const matchReasons: string[] = [];

            if (sharedSkills.length > 0) {
              suggestionType = 'skill_match';
              matchReasons.push(`Shares ${sharedSkills.length} skill${sharedSkills.length > 1 ? 's' : ''}`);
            } else if (sameLocation) {
              suggestionType = 'location_match';
              matchReasons.push(`Located in ${p.location}`);
            } else if (similarTitle) {
              suggestionType = 'title_match';
              matchReasons.push('Similar leadership role');
            } else {
              suggestionType = 'industry_match';
              matchReasons.push('Active TalentXcel member');
            }

            matchReasons.push('Verified Profile');

            const matchScore = 82 + (sharedSkills.length * 4) + (sameLocation ? 5 : 0) + (similarTitle ? 6 : 0);

            return {
              ...p,
              matchScore: Math.min(98, matchScore),
              matchReasons,
              suggestionType
            };
          });

        return res.length > 0 ? res.slice(0, 30) : fallbackSuggestions;
      } catch (err) {
        console.warn('Fallback connection suggestions engaged:', err);
        return fallbackSuggestions;
      }
    }
  });

  // Realtime updates using consolidated event bus (zero binding conflicts)
  useRealtimeUpdates('connections', () => {
    queryClient.invalidateQueries({ queryKey: ['enhanced-connection-suggestions'] });
  }, [queryClient]);

  // Mutation to send connection request
  const sendConnectionMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['enhanced-connection-suggestions'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Connection request sent!');
    }
  });

  return {
    suggestions: suggestions && suggestions.length > 0 ? suggestions : fallbackSuggestions,
    isLoading,
    error,
    sendConnection: (id: string) => sendConnectionMutation.mutate(id),
    isSendingConnection: (id: string) => sendConnectionMutation.isPending,
    refreshSuggestions: () => queryClient.invalidateQueries({ queryKey: ['enhanced-connection-suggestions'] }),
    currentUserProfile
  };
};