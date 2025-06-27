
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
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
