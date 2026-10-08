import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { setSubdomainRedirect } from '@/utils/subdomainRedirect';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { resolvePostAuthDestination } from '@/utils/intentRouting';

const Login = () => {
  const { user, loading } = useOptimizedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl');

  useEffect(() => {
    if (redirectParam) {
      setSubdomainRedirect(redirectParam);
    }
  }, [redirectParam]);

  useEffect(() => {
    if (!loading && user) {
      const destination = resolvePostAuthDestination({
        searchParams,
        userMetadata: user.user_metadata,
      });
      console.log('[LOGIN AUTH CHECK] User already authenticated, redirecting to:', destination);
      if (destination.startsWith('http://') || destination.startsWith('https://')) {
        window.location.replace(destination);
      } else {
        navigate(destination, { replace: true });
      }
    }
  }, [user, loading, searchParams, navigate]);

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your TalentXcel account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
