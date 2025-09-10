
import React, { useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { extractSubdomainContext, setSubdomainRedirect } from '@/utils/subdomainRedirect';

const Login = () => {
  // Store subdomain context on component mount
  useEffect(() => {
    const subdomainPath = extractSubdomainContext();
    if (subdomainPath) {
      setSubdomainRedirect(subdomainPath);
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
