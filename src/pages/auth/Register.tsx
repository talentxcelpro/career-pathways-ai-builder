
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout
      title="Join TalentXcel"
      description="Create your account to get started"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
