import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';
import { PerformanceOptimizer } from '@/components/seo/PerformanceOptimizer';

const JobsByRole: React.FC = () => {
  const { role, location } = useParams<{ role: string; location?: string }>();

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div>
      <SEOPageGenerator 
        pageType="job-role"
        role={role}
        location={location}
      />
    </div>
  );
};

export default JobsByRole;