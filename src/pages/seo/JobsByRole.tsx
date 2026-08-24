import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

const JobsByRole: React.FC = () => {
  const params = useParams<Record<string, string>>();
  const rawRole = params.role || 'software-engineer';
  const cleanRole = decodeURIComponent(rawRole).replace(/[-_]+/g, ' ');

  return (
    <div>
      <SEOPageGenerator 
        pageType="job-role"
        role={cleanRole}
        location={params.location}
      />
    </div>
  );
};

export default JobsByRole;