
import React, { useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { setSubdomainRedirect } from '@/utils/subdomainRedirect';

const Login = () => {
  // Store subdomain context from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    if (redirectParam) {
      setSubdomainRedirect(redirectParam);
    }
  }, []);

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
