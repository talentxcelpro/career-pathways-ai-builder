import React from 'react';
import { useStructuredData } from '@/hooks/useStructuredData';

interface EnhancedJobStructuredDataProps {
  job: {
    id: string;
    title: string;
    description: string;
    company_name?: string;
    employment_type?: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    created_at: string;
    posted_at?: string;
    expires_at?: string;
    expiry_date?: string;
    seo_slug?: string;
    companies?: {
      name: string;
      website?: string;
      logo_url?: string;
      industry?: string;
    };
    requirements?: string;
    skills_required?: string[];
    benefits?: string[];
    is_remote?: boolean;
    street_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    country_code?: string;
    applicant_country?: string;
    external_url?: string;
  };
}

/**
 * Enhanced JobPosting JSON-LD Component
 * Converts Next.js approach to React/Vite with comprehensive Google Jobs schema
 * Implements all required and recommended fields for rich snippets
 */
export const EnhancedJobStructuredData: React.FC<EnhancedJobStructuredDataProps> = ({ job }) => {
  // Parse location components
  const locationParts = job.location?.split(',') || [];
  const city = job.city || locationParts[0]?.trim() || job.location || 'Unknown City';
  const state = job.state || locationParts[1]?.trim() || 'Unknown State';
  const country = job.country || job.country_code || 'IN';
  const countryName = job.applicant_country || (country === 'IN' ? 'India' : 'United Arab Emirates');

  // Format employment type for schema.org
  const formatEmploymentType = (type?: string): string => {
    if (!type) return 'FULL_TIME';
    const normalized = type.toUpperCase().replace(/[-_\s]/g, '_');
    const mapping: { [key: string]: string } = {
      'FULL_TIME': 'FULL_TIME',
      'PART_TIME': 'PART_TIME',
      'CONTRACT': 'CONTRACTOR',
      'CONTRACTOR': 'CONTRACTOR',
      'TEMPORARY': 'TEMPORARY',
      'INTERN': 'INTERN',
      'INTERNSHIP': 'INTERN',
      'FREELANCE': 'CONTRACTOR'
    };
    return mapping[normalized] || 'FULL_TIME';
  };

  // Format salary currency
  const currency = job.salary_currency || (country === 'AE' ? 'AED' : 'INR');

  // Calculate valid through date (30 days from created_at if not provided)
  const validThrough = job.expires_at || job.expiry_date || (() => {
    const date = new Date(job.posted_at || job.created_at);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  })();

  // Get company information
  const companyName = job.companies?.name || job.company_name || 'Company';
  const companyWebsite = job.companies?.website || job.external_url || 'https://talentxcel.in';
  const companyLogo = job.companies?.logo_url || 'https://talentxcel.in/logo.png';

  // Build comprehensive structured data
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "TalentXcel",
      "value": job.id
    },
    "hiringOrganization": {
      "@type": "Organization",
      "name": companyName,
      "sameAs": companyWebsite,
      "logo": {
        "@type": "ImageObject",
        "url": companyLogo
      },
      ...(job.companies?.industry && { "industry": job.companies.industry })
    },
    "employmentType": formatEmploymentType(job.employment_type),
    "jobLocation": job.is_remote ? {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": country
      },
      "additionalProperty": {
        "@type": "PropertyValue",
        "name": "jobLocationType",
        "value": "TELECOMMUTE"
      }
    } : {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": job.street_address || "",
        "addressLocality": city,
        "addressRegion": state,
        "postalCode": job.postal_code || "",
        "addressCountry": country
      }
    },
    "datePosted": (job.posted_at || job.created_at).split('T')[0], // ISO date format
    "validThrough": validThrough,
    "url": `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": countryName
    },
    "directApply": true,
    "applicationContact": {
      "@type": "ContactPoint",
      "url": `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
      "contactType": "Application"
    },
    // Add salary information if available
    ...(job.salary_min && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": currency,
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary_min,
          "minValue": job.salary_min,
          "maxValue": job.salary_max || job.salary_min,
          "unitText": "YEAR"
        }
      }
    }),
    // Add industry if available
    ...(job.companies?.industry && {
      "industry": job.companies.industry
    }),
    // Add work hours (standard for full-time positions)
    "workHours": job.employment_type?.toLowerCase().includes('part') ? "20 hours per week" : "40 hours per week",
    // Add qualifications if available
    ...(job.requirements && {
      "qualifications": job.requirements.split('\n').filter(Boolean)
    }),
    // Add skills if available
    ...(job.skills_required?.length && {
      "skills": job.skills_required.join(', ')
    }),
    // Add benefits if available
    ...(job.benefits?.length && {
      "jobBenefits": job.benefits
    }),
    // Add remote work information
    ...(job.is_remote && {
      "jobLocationType": "TELECOMMUTE"
    }),
    // Add incentive compensation if salary available
    ...(job.salary_min && {
      "incentiveCompensation": `Competitive salary ranging from ${currency} ${job.salary_min.toLocaleString()} to ${currency} ${(job.salary_max || job.salary_min).toLocaleString()} annually`
    })
  };

  // Remove undefined fields for cleaner JSON
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData, (key, value) => {
    return value === undefined ? null : value;
  }));

  // Use the structured data hook to inject the schema
  useStructuredData({
    schema: JSON.stringify(cleanStructuredData),
    id: `enhanced-job-${job.id}-structured-data`
  });

  return null; // This component only injects structured data
};