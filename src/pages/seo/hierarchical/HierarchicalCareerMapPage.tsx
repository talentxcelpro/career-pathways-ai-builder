import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface CareerMapParams extends Record<string, string | undefined> {
  industry?: string;
  path?: string;
  role?: string;
}

export const HierarchicalCareerMapPage: React.FC = () => {
  const { industry, path, role } = useParams<CareerMapParams>();

  return (
    <SEOPageGenerator
      pageType="career-path"
      industry={industry}
      role={role || path}
    />
  );
};