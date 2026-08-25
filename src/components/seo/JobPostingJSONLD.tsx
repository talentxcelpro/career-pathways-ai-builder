import React from 'react';
import { buildJobPostingSchema, RawJobData } from '@/lib/seo/jobPostingSchema';

interface JobPostingJSONLDProps {
  job: RawJobData;
}

export const JobPostingJSONLD: React.FC<JobPostingJSONLDProps> = ({ job }) => {
  const structuredData = buildJobPostingSchema(job);
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default JobPostingJSONLD;