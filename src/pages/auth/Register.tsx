
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { MinimalRegisterForm } from '@/components/auth/MinimalRegisterForm';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { resolvePostAuthDestination } from '@/utils/intentRouting';

const Register = () => {
  const { user, loading } = useOptimizedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && user) {
      const destination = resolvePostAuthDestination({
        searchParams,
        userMetadata: user.user_metadata,
      });
      navigate(destination, { replace: true });
    }
  }, [user, loading, searchParams, navigate]);

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
