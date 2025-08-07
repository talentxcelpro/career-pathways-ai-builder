import React from 'react';
import { SEOHead } from './SEOHead';
import { JobStructuredData } from './JobStructuredData';
import { InternalLinks } from './InternalLinks';

interface EnhancedJobSEOProps {
  job: {
    id: string;
    title: string;
    description: string;
    company_name: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    salary_unit?: string;
    employment_type?: string;
    external_url?: string;
    created_at: string;
    expires_at: string;
    posted_at?: string;
    is_remote?: boolean;
    qualifications?: string;
    education_requirements?: string;
    experience_requirements?: string;
    job_benefits?: string;
    industry?: string;
    organization_logo_url?: string;
    organization_website?: string;
    applicant_location_requirements?: string;
    seo_slug?: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    structured_data?: any;
  };
}

export const EnhancedJobSEO: React.FC<EnhancedJobSEOProps> = ({ job }) => {
  // Generate comprehensive meta title
  const metaTitle = job.meta_title || 
    `${job.title} at ${job.company_name} in ${job.location} | TalentXcel Jobs`;

  // Generate rich meta description with salary info
  const salaryText = job.salary_min && job.salary_max 
    ? `Salary: ${job.salary_min}-${job.salary_max} ${job.salary_currency || 'INR'}`
    : job.salary_min 
    ? `Salary: ${job.salary_min}+ ${job.salary_currency || 'INR'}`
    : 'Competitive salary';

  const metaDescription = job.meta_description || 
    `Apply for ${job.title} position at ${job.company_name} in ${job.location}. ${salaryText}. ${job.is_remote ? 'Remote work available. ' : ''}Apply now on TalentXcel!`;

  // Generate comprehensive keywords
  const keywords = job.keywords || [
    job.title.toLowerCase(),
    `${job.title.toLowerCase()} jobs`,
    `${job.title.toLowerCase()} in ${job.location?.toLowerCase()}`,
    `${job.company_name?.toLowerCase()} jobs`,
    `jobs in ${job.location?.toLowerCase()}`,
    `${job.employment_type?.toLowerCase()} jobs`,
    ...(job.industry ? [job.industry.toLowerCase()] : []),
    ...(job.is_remote ? ['remote jobs', 'work from home'] : []),
    'career opportunities',
    'talentxcel'
  ];

  // Canonical URL
  const canonicalUrl = `https://talentxcel.in/jobs/${job.seo_slug || job.id}`;

  // Open Graph image
  const ogImage = job.organization_logo_url || 
    `https://talentxcel.in/api/og/job?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location)}`;

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        keywords={keywords}
        canonical={canonicalUrl}
        image={ogImage}
        type="article"
        publishedTime={job.posted_at || job.created_at}
        modifiedTime={job.created_at}
        author={job.company_name}
      />
      <JobStructuredData job={job} />
      <InternalLinks currentPage={`/jobs/${job.seo_slug || job.id}`} />
    </>
  );
};