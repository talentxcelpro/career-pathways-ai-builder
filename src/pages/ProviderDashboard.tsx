import React from 'react';
import { ServiceProviderDashboard } from '@/components/services/ServiceProviderDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSEO } from '@/hooks/useSEO';

const ProviderDashboard: React.FC = () => {
  useSEO({
    title: 'Provider Dashboard - Manage Your Services | TalentXcel',
    description: 'Manage your services, track orders, view earnings, and grow your business on TalentXcel marketplace.',
    keywords: [
      'provider dashboard',
      'service provider',
      'manage services',
      'track orders',
      'earnings dashboard',
      'freelance business'
    ],
    canonical: 'https://talentxcel.in/provider/dashboard'
  });

  return (
    <ProtectedRoute>
      <ServiceProviderDashboard />
    </ProtectedRoute>
  );
};

export default ProviderDashboard;