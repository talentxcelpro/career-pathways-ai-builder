
import React from 'react';

interface JobPostingStructuredDataProps {
  job: any;
}

export const JobPostingStructuredData: React.FC<JobPostingStructuredDataProps> = ({ job }) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "TalentXcel Job ID",
      "value": job.id
    },
    "datePosted": job.posted_at || job.created_at,
    "validThrough": job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": job.employment_type?.toUpperCase().replace('_', ''),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companies?.name || "TalentXcel Partner",
      "sameAs": job.companies?.website,
      "logo": job.companies?.logo_url ? {
        "@type": "ImageObject",
        "url": job.companies.logo_url
      } : undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    "baseSalary": job.salary_min && job.salary_max ? {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "YEAR"
      }
    } : undefined,
    "workHours": job.employment_type === 'full_time' ? "40 hours per week" : undefined,
    "qualifications": job.requirements,
    "skills": job.skills_required?.join(', '),
    "benefits": job.benefits?.join(', '),
    "industry": job.companies?.industry,
    "jobBenefits": job.benefits,
    "educationRequirements": job.education_requirements,
    "experienceRequirements": job.experience_level
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

export const FAQStructuredData: React.FC<{ faqs: { question: string; answer: string }[] }> = ({ faqs }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

export const OrganizationStructuredData: React.FC<{ company: any }> = ({ company }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "description": company.description,
    "url": company.website,
    "logo": company.logo_url ? {
      "@type": "ImageObject",
      "url": company.logo_url
    } : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": company.location,
      "addressCountry": "IN"
    },
    "industry": company.industry,
    "foundingDate": company.founded_year ? `${company.founded_year}-01-01` : undefined,
    "numberOfEmployees": company.size_range,
    "sameAs": [
      company.website,
      company.social_links?.linkedin,
      company.social_links?.twitter
    ].filter(Boolean)
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};
