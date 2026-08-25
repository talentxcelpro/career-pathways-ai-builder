import React from 'react';
import { buildJobPostingSchema, RawJobData } from '@/lib/seo/jobPostingSchema';

interface EnhancedJobStructuredDataProps {
  job: RawJobData;
}

export const EnhancedJobStructuredData: React.FC<EnhancedJobStructuredDataProps> = ({ job }) => {
  const structuredData = buildJobPostingSchema(job);
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default EnhancedJobStructuredData;