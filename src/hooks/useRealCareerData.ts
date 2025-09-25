import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareerGoal {
  id: string;
  user_id: string;
  target_role: string;
  current_position: string;
  timeline_months: number;
  skills_needed: string[];
  target_company?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  title?: string;
  headline?: string;
  location?: string;
  skills?: string[];
  experience_years?: number;
  profile_picture_url?: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  confidence_score?: number;
  priority: number;
  is_viewed: boolean;
  is_dismissed: boolean;
  metadata?: any;
  created_at: string;
}

export const useRealCareerData = () => {
  const { user } = useAuth();

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch career goals
  const { data: careerGoals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['career-goals', user?.id],
    queryFn: async (): Promise<CareerGoal[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching career goals:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch AI recommendations
  const { data: aiRecommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async (): Promise<AIRecommendation[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('ai_career_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching AI recommendations:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch career passport data
  const { data: careerPassport, isLoading: passportLoading } = useQuery({
    queryKey: ['career-passport', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('career_passport')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching career passport:', error);
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  const isLoading = profileLoading || goalsLoading || recommendationsLoading || passportLoading;
  const hasCareerGoals = careerGoals.length > 0;
  const hasProfile = !!userProfile;

  return {
    userProfile,
    careerGoals,
    aiRecommendations,
    careerPassport,
    isLoading,
    hasCareerGoals,
    hasProfile,
    user
  };
};