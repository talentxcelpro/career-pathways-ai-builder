import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';
import { PerformanceOptimizer } from '@/components/seo/PerformanceOptimizer';

const CompaniesByLocation: React.FC = () => {
  const { company, location } = useParams<{ company: string; location: string }>();

  if (!company || !location) {
    return <div>Company or location not found</div>;
  }

  return (
    <PerformanceOptimizer component="companies-location" preload={false}>
      <SEOPageGenerator 
        pageType="company-location"
        company={company}
        location={location}
      />
    </PerformanceOptimizer>
  );
};

export default CompaniesByLocation;