import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { setSubdomainRedirect, getSubdomainRedirect } from '@/utils/subdomainRedirect';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

const Login = () => {
  const { user, loading } = useOptimizedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    if (redirectParam) {
      setSubdomainRedirect(redirectParam);
    }
  }, [redirectParam]);

  useEffect(() => {
    if (!loading && user) {
      const destination = redirectParam || getSubdomainRedirect() || '/network';
      console.log('[LOGIN AUTH CHECK] User already authenticated, redirecting to:', destination);
      navigate(destination, { replace: true });
    }
  }, [user, loading, redirectParam, navigate]);

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
