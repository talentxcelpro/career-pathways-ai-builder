
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
    if (!loading && isAuthenticated && user && profile) {
      console.log('User authenticated:', user.email, 'Profile:', profile);
      
      if (needsOnboarding) {
        console.log('User needs onboarding, redirecting...');
        navigate('/onboarding/role');
      } else {
        console.log('User onboarding complete, redirecting to dashboard...');
        const redirectPath = getRedirectPathForRole(profile.user_role, false);
        navigate(redirectPath);
      }
    }
  }, [user, profile, loading, isAuthenticated, needsOnboarding, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show loading while redirecting authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <LoadingSpinner size="lg" text="Redirecting..." />
    </div>
  );
};

export default Index;
