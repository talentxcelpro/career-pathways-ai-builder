import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUsernameRouting } from './useUsernameRouting';

export interface SlugProfile {
  id: string;
  full_name: string;
  title: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  about: string | null;
  headline: string | null;
  profile_picture_url: string | null;
  cover_image_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  skills: string[] | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export function useSlugProfile(slug?: string) {
  return useQuery({
    queryKey: ['profile-by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Remove @ symbol if present
      const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`slug.eq.${cleanSlug},username.eq.${cleanSlug}`)
        .maybeSingle();

      if (error) throw error;
      return data as SlugProfile;
    },
    enabled: !!slug,
  });
}

// Hook for slug routing compatibility with existing username routing
export function useSlugRouting() {
  return useUsernameRouting();
}