import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';
import { PerformanceOptimizer } from '@/components/seo/PerformanceOptimizer';

const CoursesByCategory: React.FC = () => {
  const { category, skill } = useParams<{ category: string; skill?: string }>();

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div>
      <SEOPageGenerator 
        pageType="skill-guide"
        skill={skill || category}
      />
    </div>
  );
};

export default CoursesByCategory;