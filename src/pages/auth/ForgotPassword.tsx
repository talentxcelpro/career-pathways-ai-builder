
import React from 'react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
