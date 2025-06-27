
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getRedirectPathForRole } from '@/utils/roleRouting';

const Index = () => {
  const { user, profile, loading, isAuthenticated, needsOnboarding } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only proceed if auth is not loading
    if (loading) return;

    if (isAuthenticated && user) {
      console.log('User authenticated:', user.email, 'Profile:', profile);
      
      // If user has no profile yet, wait a bit longer for it to load
      if (!profile) {
        console.log('Profile not loaded yet, waiting...');
        return;
      }
      
      if (needsOnboarding) {
        console.log('User needs onboarding, redirecting...');
        navigate('/onboarding/role', { replace: true });
      } else {
        console.log('User onboarding complete, redirecting to dashboard...');
        const redirectPath = getRedirectPathForRole(profile.user_role, false);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, profile, loading, isAuthenticated, needsOnboarding, navigate]);

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show loading while waiting for profile data or during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <LoadingSpinner size="lg" text="Redirecting..." />
    </div>
  );
};

export default Index;
