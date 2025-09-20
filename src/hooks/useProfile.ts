import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  full_name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  about: string;
  headline: string;
  profile_picture_url: string;
  cover_image_url: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  talentxcel_id: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  return { profile, isLoading, error };
}