import React from 'react';

interface JobPostingJSONLDProps {
  job: {
    id: string;
    title: string;
    description: string;
    company_name: string;
    employment_type: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    created_at: string;
    expires_at?: string;
    industry?: string;
    street_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    seo_slug?: string;
  };
}

/**
 * Enhanced JobPosting JSON-LD Component
 * Implements Google's complete JobPosting schema with all required fields
 * Fixes Search Console warnings and enables rich snippets
 */
export const JobPostingJSONLD: React.FC<JobPostingJSONLDProps> = ({ job }) => {
  // Parse location components
  const locationParts = job.location?.split(',') || [];
  const city = job.city || locationParts[0]?.trim() || 'Unknown City';
  const state = job.state || locationParts[1]?.trim() || 'Unknown State';
  const country = job.country || (job.location?.toLowerCase().includes('uae') ? 'AE' : 'IN');

  // Format employment type for schema.org
  const formatEmploymentType = (type: string): string => {
    return type?.toUpperCase().replace('-', '_') || 'FULL_TIME';
  };

  // Format salary currency
  const currency = job.salary_currency || (country === 'AE' ? 'AED' : 'INR');

  // Calculate valid through date (30 days from created_at if not provided)
  const validThrough = job.expires_at || (() => {
    const date = new Date(job.created_at);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  })();

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
      "name": job.company_name,
      "sameAs": "https://talentxcel.in",
      "logo": "https://talentxcel.in/logo.png"
    },
    "employmentType": formatEmploymentType(job.employment_type),
    "jobLocation": {
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
    "baseSalary": job.salary_min ? {
      "@type": "MonetaryAmount",
      "currency": currency,
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary_min,
        "minValue": job.salary_min,
        "maxValue": job.salary_max || job.salary_min,
        "unitText": "YEAR"
      }
    } : undefined,
    "datePosted": job.created_at.split('T')[0], // ISO date format
    "validThrough": validThrough,
    "industry": job.industry || "Information Technology",
    "url": `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": country === 'IN' ? 'India' : 'United Arab Emirates'
    },
    "jobBenefits": [
      "Health Insurance",
      "Flexible Working Hours",
      "Career Growth Opportunities"
    ],
    "workHours": "40 hours per week",
    "qualifications": [
      "Bachelor's degree or equivalent experience",
      "Strong communication skills",
      "Team collaboration abilities"
    ]
  };

  // Remove undefined fields
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0)
      }}
    />
  );
};