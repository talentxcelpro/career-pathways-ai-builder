import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Ultra-fast passport UUID to username redirect
 * No React component mounting delay, instant redirect
 */
const FastPassportRedirect = () => {
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const redirectImmediately = async () => {
      if (!userId) return;

      try {
        // 1. Check public_profiles view (accessible by anon and authenticated callers)
        const { data: pubProfile } = await supabase
          .from('public_profiles')
          .select('username')
          .eq('id', userId)
          .maybeSingle();

        if (pubProfile?.username) {
          window.location.replace(`/u/${pubProfile.username}`);
          return;
        }

        // 2. Fallback to profiles table for authenticated owners
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.username) {
          window.location.replace(`/u/${profile.username}`);
        } else {
          window.location.replace('/404');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        window.location.replace('/404');
      }
    };

    redirectImmediately();
  }, [userId]);

  // Return null to prevent any rendering
  return null;
};

export default FastPassportRedirect;