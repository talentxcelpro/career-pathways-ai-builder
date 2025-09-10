import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ReactJobStructuredDataProps {
  job: {
    id: string;
    title: string;
    description: string;
    company_name?: string;
    employment_type?: string;
    experience_level?: string;
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
    education_requirements?: string;
    experience_requirements?: string;
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
    company_logo?: string;
    company_url?: string;
    currency?: string;
    salary_value?: number;
    salary_unit?: string;
    date_posted?: string;
  };
}

/**
 * React Job Structured Data Component
 * Implements comprehensive JobPosting schema with react-helmet-async
 * Converts Next.js Head approach to React/Vite with full SEO optimization
 */
export const ReactJobStructuredData: React.FC<ReactJobStructuredDataProps> = ({ job }) => {
  // Parse location components for better address handling
  const locationParts = job.location?.split(',') || [];
  const city = job.city || locationParts[0]?.trim() || job.location || 'Unknown City';
  const state = job.state || locationParts[1]?.trim() || 'Unknown State';
  const country = job.country || job.country_code || 'IN';
  const countryName = job.applicant_country || (country === 'IN' ? 'India' : 'United Arab Emirates');

  // Format employment type for schema.org compliance
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
  const currency = job.salary_currency || job.currency || (country === 'AE' ? 'AED' : 'INR');

  // Calculate valid through date (30 days from posted date if not provided)
  const validThrough = job.expires_at || job.expiry_date || (() => {
    const date = new Date(job.date_posted || job.posted_at || job.created_at);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  })();

  // Get company information with fallbacks
  const companyName = job.companies?.name || job.company_name || 'Company';
  const companyWebsite = job.companies?.website || job.company_url || job.external_url || 'https://talentxcel.in';
  const companyLogo = job.companies?.logo_url || job.company_logo || 'https://talentxcel.in/logo.png';

  // SEO optimized title and description
  const seoTitle = `${job.title} at ${companyName} | TalentXcel`;
  const seoDescription = job.description.slice(0, 160);

  // Build comprehensive structured data for Google Jobs compliance
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: companyName,
      value: job.id,
    },
    datePosted: job.date_posted || job.posted_at || job.created_at,
    validThrough: validThrough,
    employmentType: formatEmploymentType(job.employment_type),
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      sameAs: companyWebsite,
      logo: {
        "@type": "ImageObject",
        url: companyLogo
      }
    },
    jobLocation: job.is_remote ? [
      {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: country,
        },
      },
      {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          "addressLocality": city,
          addressRegion: state,
          addressCountry: country,
        },
      }
    ] : {
      "@type": "Place", 
      address: {
        "@type": "PostalAddress",
        streetAddress: job.street_address || "",
        addressLocality: city,
        addressRegion: state,
        postalCode: job.postal_code || "",
        addressCountry: country,
      },
    },
    // Enhanced salary information for Google Jobs
    baseSalary: (job.salary_min || job.salary_value) ? {
      "@type": "MonetaryAmount",
      currency: currency,
      value: {
        "@type": "QuantitativeValue",
        value: job.salary_value || job.salary_min,
        minValue: job.salary_min,
        maxValue: job.salary_max || job.salary_min,
        unitText: job.salary_unit || "YEAR",
      },
    } : undefined,
    // Google Jobs requirements
    applicantLocationRequirements: {
      "@type": "Country",
      name: countryName,
    },
    jobLocationType: job.is_remote ? "TELECOMMUTE" : undefined,
    // Additional Google Jobs fields
    url: `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
    applicationContact: {
      "@type": "ContactPoint",
      url: `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
      contactType: "application"
    },
    // Industry and benefits for better matching
    industry: job.companies?.industry || "Technology",
    benefits: job.benefits?.length ? job.benefits : [
      "Health Insurance",
      "Flexible Work Hours", 
      "Career Development"
    ],
    // Work hours for Google Jobs
    workHours: job.employment_type?.toLowerCase().includes('part') ? 
      "Part-time" : "Full-time",
    // Education and experience requirements
    educationRequirements: job.education_requirements || 
      "Bachelor's degree or equivalent experience",
    experienceRequirements: job.experience_requirements ||
      `${job.experience_level || 'Mid-level'} experience required`,
    // Skills and qualifications
    skills: job.skills_required?.join(', ') || undefined,
    qualifications: job.requirements || undefined,
    // Direct apply capability
    directApply: true,
    // Posting organization details
    sourceOrganization: {
      "@type": "Organization", 
      name: "TalentXcel",
      url: "https://talentxcel.in"
    }
  };

  // Remove undefined fields for cleaner JSON
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData, (key, value) => {
    return value === undefined ? null : value;
  }));

  return (
    <Helmet>
      {/* Basic SEO Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://talentxcel.in/jobs/${job.seo_slug || job.id}`} />
      <meta property="og:image" content={companyLogo} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={companyLogo} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://talentxcel.in/jobs/${job.seo_slug || job.id}`} />
      
      {/* JobPosting JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(cleanStructuredData)}
      </script>
    </Helmet>
  );
};