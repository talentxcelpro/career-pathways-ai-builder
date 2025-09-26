import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for Phase 2 features
interface NetworkMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_score: number;
  match_reasons: string[];
  match_type: 'professional' | 'mentor' | 'industry' | 'skill';
  is_mutual: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
}

interface Community {
  id: string;
  name: string;
  description?: string;
  industry_category: string;
  cover_image_url?: string;
  member_count: number;
  post_count: number;
  is_private: boolean;
  is_verified: boolean;
  created_by: string;
  created_at: string;
}

interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  program_type: string;
  duration_weeks: number;
  max_mentees: number;
  current_mentees: number;
  requirements: any;
  skills_offered: string[];
  mentor_id: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

interface ProfessionalEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
  is_virtual: boolean;
  location_details: any;
  max_attendees?: number;
  current_attendees: number;
  cover_image_url?: string;
  speakers: any[];
  tags: string[];
  is_featured: boolean;
  cost_amount: number;
  organizer_id: string;
  community_id?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  skills_gained: string[];
  prerequisites: string[];
  modules: any[];
  is_collaborative: boolean;
  max_participants?: number;
  current_participants: number;
  cover_image_url?: string;
  tags: string[];
  creator_id: string;
  is_featured: boolean;
  is_public: boolean;
}

export const useNetworking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch professional network matches
  const {
    data: networkMatches,
    isLoading: networkLoading
  } = useQuery({
    queryKey: ['networkMatches', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('professional_network_matches')
        .select('*')
        .or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NetworkMatch[];
    },
    enabled: !!user
  });

  // Fetch industry communities
  const {
    data: communities,
    isLoading: communitiesLoading
  } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industry_communities')
        .select('*')
        .eq('is_private', false)
        .order('member_count', { ascending: false });

      if (error) throw error;
      return data as Community[];
    }
  });

  // Fetch mentorship programs
  const {
    data: mentorshipPrograms,
    isLoading: mentorshipLoading
  } = useQuery({
    queryKey: ['mentorshipPrograms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentorship_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MentorshipProgram[];
    }
  });

  // Fetch professional events
  const {
    data: events,
    isLoading: eventsLoading
  } = useQuery({
    queryKey: ['professionalEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('is_public', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as ProfessionalEvent[];
    }
  });

  // Fetch learning paths
  const {
    data: learningPaths,
    isLoading: learningLoading
  } = useQuery({
    queryKey: ['learningPaths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LearningPath[];
    }
  });

  // Accept network match mutation
  const acceptMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { data, error } = await supabase
        .from('professional_network_matches')
        .update({ status: 'accepted' })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networkMatches'] });
      toast.success('Network match accepted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept match');
    }
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Successfully joined community!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to join community');
    }
  });

  // Apply to mentorship program
  const applyToMentorshipMutation = useMutation({
    mutationFn: async ({
      programId,
      applicationMessage,
      goals,
      experienceLevel
    }: {
      programId: string;
      applicationMessage: string;
      goals?: string;
      experienceLevel: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mentorship_applications')
        .insert({
          program_id: programId,
          mentee_id: user.id,
          application_message: applicationMessage,
          goals,
          experience_level: experienceLevel
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorshipPrograms'] });
      toast.success('Mentorship application submitted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit application');
    }
  });

  // Register for event
  const registerForEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          registration_type: 'attendee'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalEvents'] });
      toast.success('Successfully registered for event!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register for event');
    }
  });

  // Enroll in learning path
  const enrollInLearningPathMutation = useMutation({
    mutationFn: async (learningPathId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('learning_path_enrollments')
        .insert({
          learning_path_id: learningPathId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
      toast.success('Successfully enrolled in learning path!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to enroll in learning path');
    }
  });

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      industryCategory,
      isPrivate = false
    }: {
      name: string;
      description: string;
      industryCategory: string;
      isPrivate?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('industry_communities')
        .insert({
          name,
          description,
          industry_category: industryCategory,
          is_private: isPrivate,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create community');
    }
  });

  return {
    // Data
    networkMatches,
    communities,
    mentorshipPrograms,
    events,
    learningPaths,

    // Loading states
    isLoading: networkLoading || communitiesLoading || mentorshipLoading || eventsLoading || learningLoading,

    // Actions
    acceptMatch: acceptMatchMutation.mutateAsync,
    joinCommunity: joinCommunityMutation.mutateAsync,
    applyToMentorship: applyToMentorshipMutation.mutateAsync,
    registerForEvent: registerForEventMutation.mutateAsync,
    enrollInLearningPath: enrollInLearningPathMutation.mutateAsync,
    createCommunity: createCommunityMutation.mutateAsync,

    // Mutation states
    isProcessing: acceptMatchMutation.isPending || 
                  joinCommunityMutation.isPending || 
                  applyToMentorshipMutation.isPending ||
                  registerForEventMutation.isPending ||
                  enrollInLearningPathMutation.isPending ||
                  createCommunityMutation.isPending
  };
};