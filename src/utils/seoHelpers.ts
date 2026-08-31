/**
 * Enhanced SEO utilities for Google Jobs compatibility
 */

export interface JobSEOData {
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryUnit?: string;
  employmentType?: string;
  isRemote?: boolean;
  postedDate: string;
  expiryDate: string;
  industry?: string;
  benefits?: string;
  qualifications?: string;
  educationRequirements?: string;
  experienceRequirements?: string;
}

/**
 * Generate SEO-optimized meta title following TalentXcel blueprint
 */
export const generateSEOTitle = (job: JobSEOData): string => {
  // TalentXcel blueprint format: <Job Title> | TalentXcel
  const title = `${job.title} | TalentXcel`;
  
  // Keep under 60 characters for optimal SEO
  if (title.length <= 60) {
    return title;
  }
  
  // Fallback: shorter version without location
  return `${job.title.substring(0, 40)}... | TalentXcel`;
};

/**
 * Generate comprehensive meta description following TalentXcel blueprint
 */
export const generateSEODescription = (job: JobSEOData): string => {
  // TalentXcel blueprint format: Apply for <Job Title> at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!
  const baseDescription = `Apply for ${job.title} at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!`;
  
  // Keep under 160 characters for optimal SEO
  if (baseDescription.length <= 160) {
    return baseDescription;
  }
  
  // Fallback: shorter version
  return `Apply for ${job.title} at TalentXcel. Excellent learning and career growth opportunities. Apply today!`;
};

/**
 * Generate comprehensive keywords array
 */
export const generateSEOKeywords = (job: JobSEOData): string[] => {
  const keywords = [
    job.title.toLowerCase(),
    `${job.title.toLowerCase()} jobs`,
    `${job.title.toLowerCase()} in ${job.location.toLowerCase()}`,
    `${job.company.toLowerCase()} jobs`,
    `jobs in ${job.location.toLowerCase()}`,
    `${job.employmentType?.toLowerCase()} jobs`,
    'career opportunities',
    'talentxcel'
  ];

  // Add industry-specific keywords
  if (job.industry) {
    keywords.push(
      job.industry.toLowerCase(),
      `${job.industry.toLowerCase()} jobs`
    );
  }

  // Add remote work keywords
  if (job.isRemote) {
    keywords.push('remote jobs', 'work from home', 'remote work');
  }

  // Add qualification-based keywords
  if (job.qualifications) {
    const qualificationWords = job.qualifications.toLowerCase().split(/[\s,]+/);
    keywords.push(...qualificationWords.filter(word => word.length > 3));
  }

  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Generate SEO-friendly slug
 */
export const generateSEOSlug = (title: string, company: string, location: string, jobId: string): string => {
  const baseSlug = `${title}-at-${company}-in-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add job ID suffix for uniqueness
  const slug = `${baseSlug}-${jobId.substring(0, 8)}`;
  
  // Limit to 100 characters
  return slug.substring(0, 100);
};

/**
 * Generate Google Jobs compatible structured data
 */
export const generateJobStructuredData = (job: JobSEOData & { id: string; externalUrl?: string; organizationLogo?: string; organizationWebsite?: string }) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company || "TalentXcel",
      "value": `TXL-${(job.id || 'job').substring(0, 8)}`
    },
    "datePosted": job.postedDate || new Date().toISOString(),
    "validThrough": (() => {
      try {
        const d = job.expiryDate ? new Date(job.expiryDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        return isNaN(d.getTime()) ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() : d.toISOString();
      } catch {
        return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      }
    })(),
    "employmentType": job.employmentType?.toLowerCase().includes('full') ? 'FULL_TIME' :
                     job.employmentType?.toLowerCase().includes('part') ? 'PART_TIME' :
                     job.employmentType?.toLowerCase().includes('contract') ? 'CONTRACTOR' :
                     job.employmentType?.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME',
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company || "TalentXcel Services",
      "sameAs": job.organizationWebsite || "https://talentxcel.in",
      "logo": job.organizationLogo || "https://talentxcel.in/logo.png"
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
      "name": "India"
    }
  };

  // Add optional fields
  if (job.isRemote) {
    (structuredData as any).jobLocationType = "TELECOMMUTE";
  }

  if (job.salaryMin || job.salaryMax) {
    (structuredData as any).baseSalary = {
      "@type": "MonetaryAmount",
      "currency": job.salaryCurrency || "INR",
      "value": {
        "@type": "QuantitativeValue",
        ...(job.salaryMin && { "minValue": job.salaryMin }),
        ...(job.salaryMax && { "maxValue": job.salaryMax }),
        "unitText": job.salaryUnit || "YEAR"
      }
    };
  }

  if (job.qualifications) {
    (structuredData as any).qualifications = job.qualifications;
  }

  if (job.educationRequirements) {
    (structuredData as any).educationRequirements = job.educationRequirements;
  }

  if (job.experienceRequirements) {
    (structuredData as any).experienceRequirements = job.experienceRequirements;
  }

  if (job.benefits) {
    (structuredData as any).jobBenefits = job.benefits;
  }

  if (job.industry) {
    (structuredData as any).industry = job.industry;
  }

  return structuredData;
};

/**
 * Validate job data for SEO requirements
 */
export const validateJobSEO = (job: Partial<JobSEOData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!job.title || job.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (!job.company || job.company.length < 2) {
    errors.push('Company name is required');
  }

  if (!job.location || job.location.length < 2) {
    errors.push('Location is required');
  }

  if (!job.description || job.description.length < 50) {
    errors.push('Description must be at least 50 characters long');
  }

  if (!job.postedDate) {
    errors.push('Posted date is required');
  }

  if (!job.expiryDate) {
    errors.push('Expiry date is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate breadcrumb schema for job pages
 */
export const generateJobBreadcrumbSchema = (job: { title: string; company: string; location: string; slug?: string; id: string }) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://talentxcel.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Jobs",
        "item": "https://talentxcel.in/jobs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Jobs in ${job.location}`,
        "item": `https://talentxcel.in/jobs/location/${job.location.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": job.title,
        "item": `https://talentxcel.in/jobs/${job.slug || job.id}`
      }
    ]
  };
};
