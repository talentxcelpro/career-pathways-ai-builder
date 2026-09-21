
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { MinimalRegisterForm } from '@/components/auth/MinimalRegisterForm';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { getSubdomainRedirect } from '@/utils/subdomainRedirect';

const Register = () => {
  const { user, loading } = useOptimizedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl');

  useEffect(() => {
    if (!loading && user) {
      const destination = redirectParam || getSubdomainRedirect() || '/network';
      navigate(destination, { replace: true });
    }
  }, [user, loading, redirectParam, navigate]);

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
