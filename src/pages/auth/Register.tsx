
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout
      title="Create Account"
      description="Join thousands of professionals advancing their careers"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
