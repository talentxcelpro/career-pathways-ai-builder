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
    employment_type?: string;
    external_url?: string;
    created_at: string;
    expires_at: string;
    structured_data?: any;
  };
}

export const JobStructuredData: React.FC<JobStructuredDataProps> = ({ job }) => {
  // Use existing structured data if available, otherwise generate it
  const structuredData = job.structured_data || {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "TalentXcel",
      "value": `TXL-${job.id.substring(0, 8)}`
    },
    "datePosted": job.created_at,
    "validThrough": job.expires_at,
    "employmentType": job.employment_type?.includes('Full') ? 'FULL_TIME' :
                     job.employment_type?.includes('Part') ? 'PART_TIME' :
                     job.employment_type?.includes('Contract') ? 'CONTRACTOR' :
                     job.employment_type?.includes('Intern') ? 'INTERN' : 'FULL_TIME',
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name,
      "sameAs": job.external_url || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    "baseSalary": (job.salary_min || job.salary_max) ? {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "INR",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary_min || job.salary_max,
        "unitText": "YEAR"
      }
    } : undefined,
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "India"
    }
  };

  // Remove undefined values from structured data
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData));

  useStructuredData({
    schema: JSON.stringify(cleanStructuredData),
    id: `job-${job.id}-structured-data`
  });

  return null; // This component only injects structured data
};