import React from 'react';
import { ServiceMarketplace } from '@/components/services/ServiceMarketplace';
import { useSEO } from '@/hooks/useSEO';

const ServicesMarketplacePage: React.FC = () => {
  useSEO({
    title: 'Services Marketplace - Find Professional Services | TalentXcel',
    description: 'Discover and hire top professional services. From career coaching to web development, find verified service providers with transparent pricing and reviews.',
    keywords: [
      'services marketplace',
      'professional services',
      'freelance services',
      'career services',
      'web development',
      'digital marketing',
      'graphic design',
      'service providers'
    ],
    canonical: 'https://talentxcel.in/marketplace'
  });

  return <ServiceMarketplace />;
};

export default ServicesMarketplacePage;