import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CareerPassportDashboard = lazy(() => import('@/pages/passport/CareerPassportDashboard'));

/**
 * Route handler for /passport/:param
 * - If :param is a UUID -> redirect to /profile/:username (SEO-friendly)
 * - Else treat as username and render CareerPassportDashboard
 */
const PassportRouteHandler: React.FC = () => {
  const { username: param } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleRoute = async () => {
      if (!param) {
        setChecking(false);
        return;
      }

      // Basic UUID check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(param)) {
        // It's a username — render dashboard by ending the check
        setChecking(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', param)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile for redirect:', error);
          // Fallback: keep user on legacy passport page if available
          navigate(`/passport/user/${param}`, { replace: true });
          return;
        }

        if (profile?.username) {
          // Redirect to SEO-friendly profile URL
          navigate(`/user/${profile.username}`, { replace: true });
        } else {
          // Fallback to legacy UUID route
          navigate(`/passport/user/${param}`, { replace: true });
        }
      } catch (e) {
        console.error('Unexpected error in passport route handler:', e);
        navigate(`/passport/user/${param}`, { replace: true });
      }
    };

    handleRoute();
  }, [param, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Not a UUID -> treat as username and render the dashboard
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <CareerPassportDashboard />
    </Suspense>
  );
};

export default PassportRouteHandler;
