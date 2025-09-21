import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface MentorMatch {
  id: string;
  full_name: string;
  title?: string;
  profile_picture_url?: string;
  location?: string;
  company?: string;
  industry?: string;
  career_stage?: string;
  expertise_areas?: string[];
  years_experience?: number;
  availability_status?: 'available' | 'busy' | 'unavailable';
  mentorship_capacity?: number;
  current_mentees?: number;
  mentorship_style?: string;
  bio?: string;
  matchScore: number;
  matchReasons: string[];
  is_mentor: boolean;
  mentor_rating?: number;
  total_mentorships?: number;
}

export interface MentorshipRequest {
  id: string;
  mentee_id: string;
  mentor_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'completed';
  message?: string;
  goals?: string[];
  duration_months?: number;
  meeting_frequency?: string;
  created_at: string;
  mentor_profile?: any;
  mentee_profile?: any;
}

export const useMentorMatching = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Get current user profile
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

  // Get mentor matches
  const { data: mentorMatches = [], isLoading: isLoadingMentors } = useQuery({
    queryKey: ['mentor-matches', user?.id],
    queryFn: async () => {
      if (!user?.id || !currentUserProfile) return [];

      console.log('Finding mentor matches for:', currentUserProfile);

      // Get potential mentors (users with more experience in similar fields)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('full_name', 'is', null);

      if (error) throw error;

      const mentorMatches: MentorMatch[] = profiles
        ?.map(profile => {
          const matchData = calculateMentorMatch(currentUserProfile, profile);
          return {
            ...profile,
            ...matchData,
            is_mentor: true, // For now, assume all experienced users can be mentors
            availability_status: 'available' as const,
            mentorship_capacity: 3,
            current_mentees: Math.floor(Math.random() * 2), // Mock data
            mentor_rating: 4.5 + Math.random() * 0.5,
            total_mentorships: Math.floor(Math.random() * 10) + 5
          };
        })
        .filter(match => match.matchScore > 15 && canBeMentor(currentUserProfile, match))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 15) || [];

      console.log('Found mentor matches:', mentorMatches.length);
      return mentorMatches;
    },
    enabled: !!user?.id && !!currentUserProfile,
    staleTime: 5 * 60 * 1000,
  });

  // Get mentorship requests
  const { data: mentorshipRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['mentorship-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('mentorship_programs')
        .select(`
          *,
          mentor_profile:profiles!mentorship_programs_mentor_id_fkey(*),
          mentee_profile:profiles!mentorship_programs_mentee_id_fkey(*)
        `)
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MentorshipRequest[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds for real-time updates
  });

  // Calculate mentor match score
  const calculateMentorMatch = (mentee: any, potentialMentor: any) => {
    let score = 0;
    const reasons: string[] = [];

    // Industry alignment (high importance for mentorship)
    if (mentee.industry && potentialMentor.industry) {
      if (mentee.industry.toLowerCase() === potentialMentor.industry.toLowerCase()) {
        score += 40;
        reasons.push('Same industry experience');
      }
    }

    // Career stage compatibility (more flexible matching)
    if (mentee.career_stage && potentialMentor.career_stage) {
      const menteeStage = getCareerStageLevel(mentee.career_stage);
      const mentorStage = getCareerStageLevel(potentialMentor.career_stage);
      
      if (mentorStage > menteeStage) {
        score += 35;
        reasons.push('Senior career level');
      } else if (mentorStage === menteeStage) {
        score += 20;
        reasons.push('Peer mentoring');
      } else if (Math.abs(mentorStage - menteeStage) === 1) {
        score += 15;
        reasons.push('Similar experience level');
      }
    }

    // Skills and interests overlap
    if (mentee.career_interests && potentialMentor.career_interests) {
      const commonInterests = mentee.career_interests.filter((interest: string) =>
        potentialMentor.career_interests?.includes(interest)
      );
      if (commonInterests.length > 0) {
        score += commonInterests.length * 15;
        reasons.push(`${commonInterests.length} shared interests`);
      }
    }

    // Location preference (can be remote or local)
    if (mentee.location && potentialMentor.location) {
      if (mentee.location.toLowerCase() === potentialMentor.location.toLowerCase()) {
        score += 10;
        reasons.push('Local mentor');
      }
    }

    // Title relevance (more lenient)
    if (mentee.title && potentialMentor.title) {
      const titleSimilarity = calculateTextSimilarity(mentee.title, potentialMentor.title);
      if (titleSimilarity > 0.1) {
        score += Math.floor(titleSimilarity * 25);
        reasons.push('Relevant experience');
      }
    }

    // Add fallback scoring for users with minimal profile data
    if (!mentee.industry && !mentee.career_interests) {
      score += 20;
      reasons.push('General mentorship match');
    }

    // Boost score if potential mentor has mentoring experience
    if (potentialMentor.is_mentor) {
      score += 15;
      reasons.push('Experienced mentor');
    }

    return {
      matchScore: Math.min(score, 100),
      matchReasons: reasons
    };
  };

  const getCareerStageLevel = (stage: string): number => {
    const stages: { [key: string]: number } = {
      'student': 1,
      'entry-level': 2,
      'mid-level': 3,
      'senior': 4,
      'executive': 5,
      'c-level': 6
    };
    return stages[stage.toLowerCase()] || 2;
  };

  const canBeMentor = (mentee: any, potentialMentor: any): boolean => {
    if (!mentee.career_stage || !potentialMentor.career_stage) return true;
    
    const menteeLevel = getCareerStageLevel(mentee.career_stage);
    const mentorLevel = getCareerStageLevel(potentialMentor.career_stage);
    
    // Allow peer mentoring and same-level mentoring for broader matches
    return mentorLevel >= menteeLevel || Math.abs(mentorLevel - menteeLevel) <= 1;
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

  // Send mentorship request
  const requestMentorshipMutation = useMutation({
    mutationFn: async ({ 
      mentorId, 
      message, 
      goals = [], 
      durationMonths = 6, 
      meetingFrequency = 'bi-weekly' 
    }: {
      mentorId: string;
      message: string;
      goals?: string[];
      durationMonths?: number;
      meetingFrequency?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mentorship_programs')
        .insert({
          mentee_id: user.id,
          mentor_id: mentorId,
          status: 'pending',
          program_description: message,
          duration_months: durationMonths,
          start_date: new Date().toISOString(),
          program_goals: goals
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
      queryClient.invalidateQueries({ queryKey: ['mentor-matches'] });
      toast.success('Mentorship request sent!');
    },
    onError: (error: any) => {
      toast.error('Failed to send mentorship request');
      console.error(error);
    }
  });

  // Respond to mentorship request
  const respondToMentorshipMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      response 
    }: {
      requestId: string;
      action: 'accept' | 'decline';
      response?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mentorship_programs')
        .update({
          status: action === 'accept' ? 'active' : 'declined',
          mentor_response: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('mentor_id', user.id) // Ensure only mentor can respond
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
      toast.success(`Mentorship request ${variables.action}ed`);
    },
    onError: (error: any) => {
      toast.error('Failed to respond to mentorship request');
      console.error(error);
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('mentorship-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorship_programs',
          filter: `or(mentor_id.eq.${user.id},mentee_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Mentorship real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
          
          if (payload.eventType === 'INSERT') {
            toast.info('New mentorship request received');
          } else if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            if (newRecord.status === 'active') {
              toast.success('Mentorship request accepted!');
            } else if (newRecord.status === 'declined') {
              toast.info('Mentorship request declined');
            }
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [user?.id, queryClient]);

  return {
    mentorMatches,
    isLoadingMentors,
    mentorshipRequests,
    isLoadingRequests,
    requestMentorship: requestMentorshipMutation.mutate,
    isRequestingMentorship: requestMentorshipMutation.isPending,
    respondToMentorship: respondToMentorshipMutation.mutate,
    isRespondingToMentorship: respondToMentorshipMutation.isPending,
    currentUserProfile
  };
};