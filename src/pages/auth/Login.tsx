
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AuthForm type="login" />
    </div>
  );
};

export default Login;
