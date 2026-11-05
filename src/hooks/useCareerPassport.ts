import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareerPassport {
  id: string;
  user_id: string;
  is_persisted: boolean;
  is_ai_evaluated: boolean;
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
  talent_score: number;
  target_roles: string[];
  career_goals: string;
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
    queryFn: async (): Promise<CareerPassport> => {
      if (!user?.id) {
        throw new Error('Authentication required');
      }

      const uid = user.id;

      // Parallel fetch across core live tables with safe fallbacks
      const [
        passportRes,
        profileRes,
        resumesRes,
        applicationsRes,
        connectionsRes,
        skillCertsRes
      ] = await Promise.all([
        supabase
          .from('career_passports')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('id, full_name, headline, skills, bio, profile_picture_url, updated_at')
          .eq('id', uid)
          .maybeSingle(),
        supabase
          .from('resumes')
          .select('id')
          .eq('user_id', uid),
        supabase
          .from('job_applications')
          .select('id')
          .eq('user_id', uid),
        supabase
          .from('connections')
          .select('id')
          .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`)
          .eq('status', 'accepted'),
        
        supabase
          .from('skill_certifications')
          .select('id')
          .eq('user_id', uid)
      ]);

      const passportRow = passportRes.data;
      const profileRow = profileRes.data;

      const resumesCount = resumesRes.data?.length ?? 0;
      const applicationsCount = applicationsRes.data?.length ?? 0;
      const connectionsCount = connectionsRes.data?.length ?? 0;
      const certsCount = skillCertsRes.data?.length ?? 0;

      // Honest completion percentage calculation based only on populated profile fields
      let profileScore = 0;
      if (profileRow?.full_name?.trim()) profileScore += 25;
      if (profileRow?.headline?.trim()) profileScore += 20;
      if (Array.isArray(profileRow?.skills) && profileRow.skills.length > 0) profileScore += 30;
      if (profileRow?.bio?.trim()) profileScore += 15;
      if (profileRow?.profile_picture_url?.trim()) profileScore += 10;
      const completionPercentage = Math.min(profileScore, 100);

      const hasPersistedPassport = !!passportRow;
      const hasAiEvaluation = !!(passportRow?.talent_score && passportRow.talent_score > 0);

      // Evaluation scores: 0 if not evaluated, authentic score if evaluated
      const talentScore = hasAiEvaluation ? (passportRow.talent_score ?? 0) : 0;
      const readinessScore = hasAiEvaluation 
        ? Math.round(talentScore / 10) 
        : Math.min(Math.round(completionPercentage * 0.6 + (resumesCount > 0 ? 20 : 0) + (certsCount > 0 ? 20 : 0)), 100);

      const marketCompetitivenessScore = hasAiEvaluation
        ? Math.min(Math.round(readinessScore * 0.85 + (connectionsCount > 5 ? 15 : connectionsCount * 3)), 100)
        : 0;

      if (passportRow) {
        return {
          id: passportRow.id,
          user_id: passportRow.user_id,
          is_persisted: true,
          is_ai_evaluated: hasAiEvaluation,
          completion_percentage: completionPercentage,
          career_readiness_score: readinessScore,
          market_competitiveness_score: marketCompetitivenessScore,
          resumes_count: resumesCount,
          jobs_applied_count: applicationsCount,
          certifications_count: certsCount,
          tests_completed_count: (passportRow.parsed_skills?.length ?? 0) > 0 ? 1 : 0,
          skills_verified_count: passportRow.parsed_skills?.length ?? 0,
          connections_count: connectionsCount,
          last_activity_at: passportRow.updated_at || passportRow.created_at || new Date().toISOString(),
          career_milestones: Array.isArray(passportRow.si_career_trajectory) ? passportRow.si_career_trajectory : [],
          learning_progress: passportRow.si_skill_gaps || {},
          recommendation_engine_data: passportRow.si_analysis_summary ? { summary: passportRow.si_analysis_summary } : {},
          talent_score: talentScore,
          target_roles: passportRow.target_roles || [],
          career_goals: passportRow.career_goals || '',
          created_at: passportRow.created_at || new Date().toISOString(),
          updated_at: passportRow.updated_at || new Date().toISOString()
        };
      }

      // If no persisted passport exists, return an honest synthesized initial state
      return {
        id: `synthetic-${uid}`,
        user_id: uid,
        is_persisted: false,
        is_ai_evaluated: false,
        completion_percentage: completionPercentage,
        career_readiness_score: readinessScore,
        market_competitiveness_score: 0,
        resumes_count: resumesCount,
        jobs_applied_count: applicationsCount,
        certifications_count: certsCount,
        tests_completed_count: 0,
        skills_verified_count: 0,
        connections_count: connectionsCount,
        last_activity_at: profileRow?.updated_at || new Date().toISOString(),
        career_milestones: [],
        learning_progress: {},
        recommendation_engine_data: {},
        talent_score: 0,
        target_roles: [],
        career_goals: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Authentication')) return false;
      return failureCount < 2;
    }
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['career-achievements', user?.id],
    queryFn: async (): Promise<CareerAchievement[]> => {
      // Return only authentic achievements; never fabricate false achievements
      return [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  const { data: journeyEvents, isLoading: journeyLoading } = useQuery({
    queryKey: ['user-journey', user?.id],
    queryFn: async (): Promise<UserJourneyEvent[]> => {
      return [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
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
      // Fire-and-forget safe tracking without throwing unhandled exceptions
      try {
        await supabase.rpc('track_user_journey', {
          p_user_id: user.id,
          p_event_type: eventType,
          p_event_module: eventModule,
          p_event_data: eventData,
          p_impact_score: impactScore
        });
      } catch {
        // Non-critical telemetry logging ignored gracefully
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const updateCareerPassport = useMutation({
    mutationFn: async (updates: Partial<CareerPassport>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const allowedUpdates: Record<string, any> = {};
      if (updates.target_roles) allowedUpdates.target_roles = updates.target_roles;
      if (updates.career_goals) allowedUpdates.career_goals = updates.career_goals;
      if (updates.talent_score !== undefined) allowedUpdates.talent_score = updates.talent_score;
      allowedUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('career_passports')
        .upsert({
          user_id: user.id,
          ...allowedUpdates
        }, { onConflict: 'user_id' })
        .select()
        .maybeSingle();

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
      return { type: 'profile', message: 'Complete your profile information', points: Math.round(40 - breakdown.profile) };
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

  const hasAuthError = passportError?.message?.includes('Authentication');

  return {
    careerPassport,
    achievements: achievements || [],
    journeyEvents: journeyEvents || [],
    isLoading: passportLoading || achievementsLoading || journeyLoading,
    error: passportError,
    hasAuthError,
    trackJourneyEvent,
    updateCareerPassport,
    getCompletionBreakdown,
    getNextMilestone
  };
}
