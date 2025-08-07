import React from 'react';
import { useStructuredData } from '@/hooks/useStructuredData';

interface JobStructuredDataProps {
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
    structured_data?: any;
  };
}

export const JobStructuredData: React.FC<JobStructuredDataProps> = ({ job }) => {
  // Generate comprehensive Google Jobs compatible structured data
  const structuredData = job.structured_data || {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company_name || "TalentXcel",
      "value": `TXL-${job.id.substring(0, 8)}`
    },
    "datePosted": job.posted_at || job.created_at,
    "validThrough": job.expires_at,
    "employmentType": job.employment_type?.toLowerCase().includes('full') ? 'FULL_TIME' :
                     job.employment_type?.toLowerCase().includes('part') ? 'PART_TIME' :
                     job.employment_type?.toLowerCase().includes('contract') ? 'CONTRACTOR' :
                     job.employment_type?.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME',
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name || "Company",
      "sameAs": job.organization_website || job.external_url || "https://talentxcel.in",
      "logo": job.organization_logo_url || "https://talentxcel.in/logo.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": job.applicant_location_requirements || "India"
    },
    // Add remote work information
    ...(job.is_remote && {
      "jobLocationType": "TELECOMMUTE"
    }),
    // Add salary information if available
    ...((job.salary_min || job.salary_max) && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": job.salary_currency || "INR",
        "value": {
          "@type": "QuantitativeValue",
          ...(job.salary_min && { "minValue": job.salary_min }),
          ...(job.salary_max && { "maxValue": job.salary_max }),
          "unitText": job.salary_unit || "YEAR"
        }
      }
    }),
    // Add qualifications if available
    ...(job.qualifications && {
      "qualifications": job.qualifications
    }),
    // Add education requirements if available
    ...(job.education_requirements && {
      "educationRequirements": job.education_requirements
    }),
    // Add experience requirements if available
    ...(job.experience_requirements && {
      "experienceRequirements": job.experience_requirements
    }),
    // Add benefits if available
    ...(job.job_benefits && {
      "jobBenefits": job.job_benefits
    }),
    // Add industry if available
    ...(job.industry && {
      "industry": job.industry
    })
  };

  // Remove undefined values from structured data
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData));

  useStructuredData({
    schema: JSON.stringify(cleanStructuredData),
    id: `job-${job.id}-structured-data`
  });

  return null; // This component only injects structured data
};