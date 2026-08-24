import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

const JobsBySkill: React.FC = () => {
  const params = useParams<Record<string, string>>();
  const rawSkill = params.skill || params.p2 || params.p1 || 'technology';
  const cleanSkill = decodeURIComponent(rawSkill).replace(/[-_]+/g, ' ');

  return (
    <div>
      <SEOPageGenerator 
        pageType="skill-guide"
        skill={cleanSkill}
      />
    </div>
  );
};

export default JobsBySkill;