import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';
import { PerformanceOptimizer } from '@/components/seo/PerformanceOptimizer';

const SalaryGuide: React.FC = () => {
  const { role, industry } = useParams<{ role: string; industry?: string }>();

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div>
      <SEOPageGenerator 
        pageType="career-path"
        role={role}
        industry={industry}
      />
    </div>
  );
};

export default SalaryGuide;