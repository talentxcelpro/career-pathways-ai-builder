import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface CollegesParams extends Record<string, string | undefined> {
  location?: string;
  collegeName?: string;
  field?: string;
}

export const HierarchicalCollegesPage: React.FC = () => {
  const { location, collegeName, field } = useParams<CollegesParams>();

  return (
    <SEOPageGenerator
      pageType="company-location"
      location={location}
      company={collegeName}
      industry={field}
    />
  );
};