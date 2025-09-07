import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Component to redirect from UUID-based profile URLs to username-based URLs
 * This helps with SEO migration from /network/people/:id to /profile/:username
 */
const ProfileUrlRedirect = () => {
  const { id, username } = useParams<{ id?: string; username?: string }>();
  const navigate = useNavigate();
  const param = id ?? username ?? null;

  useEffect(() => {
    const redirectToUsernameUrl = async () => {
      if (!param) {
        navigate('/404');
        return;
      }

      try {
        // If the param isn't a UUID, treat it as username/slug and redirect directly
        const value = String(param);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        if (!isUUID) {
          const clean = value.startsWith('@') ? value.slice(1) : value;
          navigate(`/${clean}`, { replace: true });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('slug')
          .eq('id', value)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          navigate('/404');
        } else if (profile?.slug) {
          // Redirect to slug-based profile route
          navigate(`/${profile.slug}`, { replace: true });
        } else {
          navigate('/404');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        navigate('/404');
      }
    };

    redirectToUsernameUrl();
  }, [param, navigate]);

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