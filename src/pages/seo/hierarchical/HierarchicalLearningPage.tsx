import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface LearningParams extends Record<string, string | undefined> {
  category?: string;
  courseName?: string;
  skill?: string;
}

export const HierarchicalLearningPage: React.FC = () => {
  const { category, courseName, skill } = useParams<LearningParams>();

  return (
    <SEOPageGenerator
      pageType="skill-guide"
      skill={skill || category}
      role={courseName}
    />
  );
};