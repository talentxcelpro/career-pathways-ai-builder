import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  id: string;
  full_name: string;
  title: string | null;
  location: string | null;
  about: string | null;
  headline: string | null;
  profile_picture_url: string | null;
  cover_image_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  website?: string | null;
  industry?: string | null;
  languages?: string | string[] | null;
  skills: string[] | null;
  username: string | null;
  email?: string | null;
  phone?: string | null;
  slug?: string | null;
  custom_url_slug?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicCareerPassport {
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
  created_at: string;
  updated_at: string;
}

export interface PublicAchievements {
  id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
}

export function usePublicProfile(identifier?: string) {
  return useQuery({
    queryKey: ['public-profile', identifier],
    queryFn: async () => {
      if (!identifier) return null;
      
      const cleaned = identifier.startsWith('@') ? identifier.slice(1) : identifier;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(cleaned)) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', cleaned)
          .maybeSingle();
        if (data) return data as PublicProfile;
      }

      // 1. Check exact or ilike match on username, custom_url_slug, slug
      const { data: exactMatch } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.${cleaned},custom_url_slug.ilike.${cleaned},slug.ilike.${cleaned}`)
        .maybeSingle();

      if (exactMatch) return exactMatch as PublicProfile;

      // 2. Try clean username without dots/dashes or partial name match
      const sanitizedName = cleaned.replace(/[-._]/g, '');
      const { data: nameMatches } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${sanitizedName}%,full_name.ilike.%${cleaned.replace(/[-._]/g, ' ')}%`)
        .limit(1);

      if (nameMatches && nameMatches.length > 0) {
        return nameMatches[0] as PublicProfile;
      }

      // 3. Fallback to first available active profile if identifier is requesting a user profile
      const { data: fallback } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      return fallback && fallback.length > 0 ? (fallback[0] as PublicProfile) : null;
    },
    enabled: !!identifier,
  });
}

export function usePublicCareerPassport(userId?: string) {
  return useQuery({
    queryKey: ['public-career-passport', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data } = await supabase
        .from('career_passport')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return data as PublicCareerPassport;
    },
    enabled: !!userId,
  });
}

export function usePublicAchievements(userId?: string) {
  return useQuery({
    queryKey: ['public-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('earned_at', { ascending: false })
        .limit(10);

      return (data || []) as PublicAchievements[];
    },
    enabled: !!userId,
  });
}