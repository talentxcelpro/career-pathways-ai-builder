import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface NetworkParams extends Record<string, string | undefined> {
  category?: string;
  topic?: string;
}

export const HierarchicalNetworkPage: React.FC = () => {
  const { category, topic } = useParams<NetworkParams>();

  return (
    <SEOPageGenerator
      pageType="career-path"
      role={category}
      skill={topic}
    />
  );
};