import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';
import { PerformanceOptimizer } from '@/components/seo/PerformanceOptimizer';

const JobsByLocation: React.FC = () => {
  const { location, role } = useParams<{ location: string; role?: string }>();

  if (!location) {
    return <div>Location not found</div>;
  }

  return (
    <div>
      <SEOPageGenerator 
        pageType="job-location"
        location={location}
        role={role}
      />
    </div>
  );
};

export default JobsByLocation;