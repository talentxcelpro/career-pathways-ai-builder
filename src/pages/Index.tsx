
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
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (needsOnboarding) {
          console.log('User needs onboarding, redirecting...');
          navigate('/onboarding/role', { replace: true });
        } else if (profile) {
          console.log('User onboarding complete, redirecting to dashboard...');
          const redirectPath = getRedirectPathForRole(profile.user_role, false);
          navigate(redirectPath, { replace: true });
        } else {
          // Fallback: redirect to dashboard if profile is null but user is authenticated
          console.log('Profile not found, redirecting to dashboard as fallback...');
          navigate('/dashboard', { replace: true });
        }
      }, 100); // Small delay to ensure state is settled

      return () => clearTimeout(timeoutId);
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

  // Show brief loading while redirecting authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <LoadingSpinner size="lg" text="Redirecting..." />
    </div>
  );
};

export default Index;
