import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Component to redirect from UUID-based passport URLs to username-based URLs
 * This helps with SEO migration from /passport/:id to /passport/:username
 */
const PassportUrlRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToUsernameUrl = async () => {
      if (!id) {
        navigate('/404');
        return;
      }

      // Check if the ID looks like a UUID (basic validation)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(id)) {
        // If it's not a UUID, it might be a username that got caught by this route
        // Redirect to the username route
        navigate(`/passport/${id}`, { replace: true });
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
          // Fallback to legacy UUID route if we can't read username (e.g., RLS)
          navigate(`/passport/user/${id}`, { replace: true });
        } else if (profile?.username) {
          // Redirect to SEO-friendly profile URL
          navigate(`/profile/${profile.username}`, { replace: true });
        } else {
          // Fallback to legacy UUID route if no username
          navigate(`/passport/user/${id}`, { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        // Fallback to legacy UUID route on unexpected errors
        navigate(`/passport/user/${id}`, { replace: true });
      }
    };

    redirectToUsernameUrl();
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Redirecting to passport...</p>
      </div>
    </div>
  );
};

export default PassportUrlRedirect;