import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface CompaniesParams extends Record<string, string | undefined> {
  location?: string;
  industry?: string;
  size?: string;
}

export const HierarchicalCompaniesPage: React.FC = () => {
  const { location, industry, size } = useParams<CompaniesParams>();

  return (
    <SEOPageGenerator
      pageType="company-location"
      location={location}
      industry={industry}
      company={size}
    />
  );
};