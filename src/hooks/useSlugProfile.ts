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
  username?: string | null;
  user_type?: string | null;
  company_name?: string | null;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export function useSlugProfile(slug?: string) {
  return useQuery({
    queryKey: ['profile-by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Remove @ symbol if present
      const cleanSlug = slug.startsWith('@') ? slug.slice(1).trim() : slug.trim();
      if (!cleanSlug) return null;
      
      // Perform multi-format query matching:
      // 1. Direct slug (e.g. arshid-hussain-wani, priyanka-dhangar)
      // 2. Custom profile URL
      // 3. Username
      // 4. Username without hyphens (e.g. priyankadhangar)
      // 5. Full name with spaces (e.g. Priyanka Dhangar)
      // 6. UUID ID match
      const nameQuery = cleanSlug.replace(/-/g, ' ');
      const compactUsername = cleanSlug.replace(/-/g, '');
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

      const conditions = [
        `slug.ilike.${cleanSlug}`,
        `custom_profile_url.ilike.${cleanSlug}`,
        `username.ilike.${cleanSlug}`,
        `username.ilike.${compactUsername}`,
        `full_name.ilike.${nameQuery}`
      ];

      if (isUUID) {
        conditions.push(`id.eq.${cleanSlug}`);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(conditions.join(','))
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching slug profile:', error);
        throw error;
      }
      
      return data as SlugProfile | null;
    },
    enabled: Boolean(slug),
  });
}

export function useSlugRouting() {
  return useUsernameRouting();
}