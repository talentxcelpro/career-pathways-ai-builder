import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';
import { PerformanceOptimizer } from '@/components/seo/PerformanceOptimizer';

const JobsBySkill: React.FC = () => {
  const { skill } = useParams<{ skill: string }>();

  if (!skill) {
    return <div>Skill not found</div>;
  }

  return (
    <PerformanceOptimizer component="jobs-skill" preload={false}>
      <SEOPageGenerator 
        pageType="skill-guide"
        skill={skill}
      />
    </PerformanceOptimizer>
  );
};

export default JobsBySkill;