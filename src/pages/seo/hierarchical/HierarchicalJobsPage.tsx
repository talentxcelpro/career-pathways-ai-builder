import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOPageGenerator } from '@/components/seo/SEOPageGenerator';

interface JobsParams extends Record<string, string | undefined> {
  type?: string;
  location?: string;
  role?: string;
  skill?: string;
  size?: string;
  topic?: string;
}

export const HierarchicalJobsPage: React.FC = () => {
  const params = useParams<JobsParams>();
  const { type, location, role, skill } = params;

  // Map to existing page types
  const getPageType = (): 'job-location' | 'job-role' | 'company-location' | 'skill-guide' | 'career-path' => {
    if (skill && location) return 'skill-guide';
    if (location) return 'job-location';
    if (role) return 'job-role';
    return 'job-location';
  };

  return (
    <SEOPageGenerator
      pageType={getPageType()}
      location={location}
      role={role}
      skill={skill}
    />
  );
};