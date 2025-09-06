import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Component to redirect from UUID-based profile URLs to username-based URLs
 * This helps with SEO migration from /network/people/:id to /profile/:username
 */
const ProfileUrlRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToUsernameUrl = async () => {
      if (!id) {
        navigate('/404');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          navigate('/404');
        } else if (profile?.username) {
          // Redirect to unified profile route
          navigate(`/user/${profile.username}`, { replace: true });
        } else {
          navigate('/404');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        navigate('/404');
      }
    };

    redirectToUsernameUrl();
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Redirecting to profile...</p>
      </div>
    </div>
  );
};

export default ProfileUrlRedirect;