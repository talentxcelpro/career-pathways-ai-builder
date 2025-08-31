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
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.username) {
          // Use window.location.replace for instant redirect without history entry
          window.location.replace(`/profile/${profile.username}`);
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