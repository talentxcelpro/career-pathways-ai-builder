
import React from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

const ResetPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPassword;
