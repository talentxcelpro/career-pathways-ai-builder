import React from 'react';
import { ServiceProviderCommandCenter } from '@/components/services/ServiceProviderDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSEO } from '@/hooks/useSEO';

const ProviderCommandCenter: React.FC = () => {
  useSEO({
    title: 'Provider CommandCenter - Manage Your Services | TalentXcel',
    description: 'Manage your services, track orders, view earnings, and grow your business on TalentXcel marketplace.',
    keywords: [
      'provider CommandCenter',
      'service provider',
      'manage services',
      'track orders',
      'earnings CommandCenter',
      'freelance business'
    ],
    canonical: 'https://talentxcel.in/provider/CommandCenter'
  });

  return (
    <ProtectedRoute>
      <ServiceProviderCommandCenter />
    </ProtectedRoute>
  );
};

export default ProviderCommandCenter;

