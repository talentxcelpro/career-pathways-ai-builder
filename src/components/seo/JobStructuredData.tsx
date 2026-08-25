import React from 'react';
import { buildJobPostingSchema, RawJobData } from '@/lib/seo/jobPostingSchema';

interface JobStructuredDataProps {
  job: RawJobData;
}

export const JobStructuredData: React.FC<JobStructuredDataProps> = ({ job }) => {
  const structuredData = buildJobPostingSchema(job);
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default JobStructuredData;