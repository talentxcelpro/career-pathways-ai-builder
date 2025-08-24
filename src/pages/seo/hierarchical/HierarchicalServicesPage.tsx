import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface ServicesParams extends Record<string, string | undefined> {
  type?: string;
  serviceName?: string;
  template?: string;
}

export const HierarchicalServicesPage: React.FC = () => {
  const { type, serviceName, template } = useParams<ServicesParams>();

  return (
    <SEOPageGenerator
      pageType="career-path"
      role={type}
      skill={serviceName || template}
    />
  );
};