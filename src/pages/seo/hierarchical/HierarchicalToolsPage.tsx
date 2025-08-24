import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface ToolsParams extends Record<string, string | undefined> {
  category?: string;
  toolName?: string;
  template?: string;
}

export const HierarchicalToolsPage: React.FC = () => {
  const { category, toolName, template } = useParams<ToolsParams>();

  return (
    <SEOPageGenerator
      pageType="skill-guide"
      skill={category}
      role={toolName || template}
    />
  );
};