import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareerPassport {
  id: string;
  user_id: string;
  completion_percentage: number;
  career_readiness_score: number;
  market_competitiveness_score: number;
  resumes_count: number;
  jobs_applied_count: number;
  certifications_count: number;
  tests_completed_count: number;
  skills_verified_count: number;
  connections_count: number;
  last_activity_at: string;
  career_milestones: any[];
  learning_progress: any;
  recommendation_engine_data: any;
  created_at: string;
  updated_at: string;
}

export interface CareerAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
}

export interface UserJourneyEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_module: string;
  event_data: any;
  impact_score: number;
  created_at: string;
}

export function useCareerPassport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: careerPassport, isLoading: passportLoading, error: passportError } = useQuery({
    queryKey: ['career-passport', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase
        .from('career_passport')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Check if it's an auth error
        if (error.message?.includes('JWT') || error.message?.includes('auth')) {
          throw new Error('Authentication session expired. Please sign in again.');
        }
        
        // Create initial passport if doesn't exist
        const { data: newPassport, error: createError } = await supabase
          .from('career_passport')
          .insert({
            user_id: user.id,
            completion_percentage: 0,
            career_readiness_score: 0,
            market_competitiveness_score: 0,
            resumes_count: 0,
            jobs_applied_count: 0,
            certifications_count: 0,
            tests_completed_count: 0,
            skills_verified_count: 0,
            connections_count: 0,
            last_activity_at: new Date().toISOString(),
            career_milestones: [],
            learning_progress: {},
            recommendation_engine_data: {}
          })
          .select()
          .single();
        
        if (createError) {
          if (createError.message?.includes('JWT') || createError.message?.includes('auth')) {
            throw new Error('Authentication session expired. Please sign in again.');
          }
          throw createError;
        }
        return newPassport as CareerPassport;
      }
      
      return data as CareerPassport;
    },
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const { data: achievements, isLoading: achievementsLoading, error: achievementsError } = useQuery({
    queryKey: ['career-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        if (error.message?.includes('JWT') || error.message?.includes('auth')) {
          throw new Error('Authentication session expired. Please sign in again.');
        }
        throw error;
      }
      return data as CareerAchievement[];
    },
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      if (error.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const { data: journeyEvents, isLoading: journeyLoading } = useQuery({
    queryKey: ['user-journey', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_journey_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserJourneyEvent[];
    },
    enabled: !!user?.id,
  });

  const trackJourneyEvent = useMutation({
    mutationFn: async ({
      eventType,
      eventModule,
      eventData = {},
      impactScore = 1
    }: {
      eventType: string;
      eventModule: string;
      eventData?: any;
      impactScore?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('track_user_journey', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_module: eventModule,
        p_event_data: eventData,
        p_impact_score: impactScore
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-journey', user?.id] });
    }
  });

  const updateCareerPassport = useMutation({
    mutationFn: async (updates: Partial<CareerPassport>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('career_passport')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const getCompletionBreakdown = () => {
    if (!careerPassport) return null;

    return {
      profile: Math.min((careerPassport.completion_percentage * 0.4), 40),
      resumes: Math.min(careerPassport.resumes_count * 25, 25),
      certifications: Math.min(careerPassport.certifications_count * 10, 20),
      tests: Math.min(careerPassport.tests_completed_count * 5, 15),
      total: careerPassport.completion_percentage
    };
  };

  const getNextMilestone = () => {
    const breakdown = getCompletionBreakdown();
    if (!breakdown) return null;

    if (breakdown.profile < 40) {
      return { type: 'profile', message: 'Complete your profile information', points: 40 - breakdown.profile };
    }
    if (breakdown.resumes < 25) {
      return { type: 'resume', message: 'Create your first resume', points: 25 - breakdown.resumes };
    }
    if (breakdown.certifications < 20) {
      return { type: 'certification', message: 'Earn a certification', points: 20 - breakdown.certifications };
    }
    if (breakdown.tests < 15) {
      return { type: 'test', message: 'Complete a skill assessment', points: 15 - breakdown.tests };
    }
    
    return null;
  };

  const hasAuthError = passportError?.message?.includes('Authentication') || 
                      achievementsError?.message?.includes('Authentication');

  return {
    careerPassport,
    achievements,
    journeyEvents,
    isLoading: passportLoading || achievementsLoading || journeyLoading,
    error: passportError || achievementsError,
    hasAuthError,
    trackJourneyEvent,
    updateCareerPassport,
    getCompletionBreakdown,
    getNextMilestone
  };
}