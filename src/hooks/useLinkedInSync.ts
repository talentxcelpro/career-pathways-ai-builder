import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LinkedInProfile {
  id: string;
  user_id: string;
  linkedin_url: string;
  profile_data: any;
  last_synced_at?: string;
  sync_status: 'pending' | 'syncing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export const useLinkedInSync = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);

  const syncLinkedInProfile = useCallback(async (linkedinUrl: string) => {
    if (!user) {
      toast.error('Please sign in to sync your LinkedIn profile');
      return;
    }

    setIsLoading(true);
    try {
      // First, save the LinkedIn URL
      const { data, error } = await supabase
        .from('linkedin_profiles')
        .upsert({
          user_id: user.id,
          linkedin_url: linkedinUrl,
          sync_status: 'syncing'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      // TODO: Implement actual LinkedIn API sync
      // For now, we'll simulate the sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error: updateError } = await supabase
        .from('linkedin_profiles')
        .update({
          sync_status: 'completed',
          last_synced_at: new Date().toISOString(),
          profile_data: {
            // Mock data - replace with actual LinkedIn API response
            name: 'John Doe',
            headline: 'Software Engineer',
            location: 'San Francisco, CA',
            experience: []
          }
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      toast.success('LinkedIn profile synced successfully!');
      
    } catch (error: any) {
      console.error('LinkedIn sync error:', error);
      toast.error(error.message || 'Failed to sync LinkedIn profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getLinkedInProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('linkedin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch LinkedIn profile:', error);
    }
  }, [user]);

  return {
    profile,
    isLoading,
    syncLinkedInProfile,
    getLinkedInProfile
  };
};