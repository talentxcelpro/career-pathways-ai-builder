import React, { useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { extractSubdomainContext, setSubdomainRedirect } from '@/utils/subdomainRedirect';

interface SubdomainGatewayProps {
  subdomain: 'employer' | 'jobs' | 'learning' | 'colleges';
  title: string;
  description: string;
}

const SubdomainGateway = ({ subdomain, title, description }: SubdomainGatewayProps) => {
  useEffect(() => {
    // Set the subdomain context for redirect after login
    setSubdomainRedirect(`/${subdomain}`);
  }, [subdomain]);

  return (
    <AuthLayout
      title={title}
      description={description}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default SubdomainGateway;