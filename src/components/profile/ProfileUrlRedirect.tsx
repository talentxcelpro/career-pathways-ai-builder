import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { generatePersonProfileSlug } from '@/utils/userProfileSlug';

/**
 * Universal Profile URL Redirect
 * Safely redirects UUIDs, legacy paths (/network/people/:id, /user/:id)
 * to canonical /profile/:slug without ever landing on 404.
 */
const ProfileUrlRedirect: React.FC = () => {
  const { id, username } = useParams<{ id?: string; username?: string }>();
  const navigate = useNavigate();
  const param = id ?? username ?? null;

  useEffect(() => {
    const redirectToProfile = async () => {
      if (!param) {
        navigate('/network', { replace: true });
        return;
      }

      try {
        const value = String(param).trim();
        const clean = value.startsWith('@') ? value.slice(1) : value;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

        if (!isUUID) {
          navigate(`/profile/${clean}`, { replace: true });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, slug, custom_profile_url')
          .eq('id', clean)
          .maybeSingle();

        if (error || !profile) {
          console.warn('Profile redirect lookup failed, routing to network directory:', error);
          navigate('/network/discover', { replace: true });
          return;
        }

        const targetSlug = profile.slug || profile.custom_profile_url || profile.username || 
          (profile.full_name ? generatePersonProfileSlug(profile.full_name) : null);

        if (targetSlug) {
          navigate(`/profile/${targetSlug}`, { replace: true });
        } else {
          navigate('/network/discover', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected profile redirect error:', err);
        navigate('/network/discover', { replace: true });
      }
    };

    redirectToProfile();
  }, [param, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/40">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm font-medium text-muted-foreground">Connecting to verified profile...</p>
      </div>
    </div>
  );
};

export default ProfileUrlRedirect;