
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { MinimalRegisterForm } from '@/components/auth/MinimalRegisterForm';

const Register = () => {
  return (
    <AuthLayout
      title="Join TalentXcel"
      description="Create your account to get started"
    >
      <MinimalRegisterForm />
    </AuthLayout>
  );
};

export default Register;
