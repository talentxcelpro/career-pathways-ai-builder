
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AuthForm type="signup" />
    </div>
  );
};

export default Register;
