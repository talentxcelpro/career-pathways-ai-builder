/**
 * TalentXcel SEO Blueprint Implementation
 * Implements the exact URL structure and SEO standards defined in the blueprint
 */

export interface TalentXcelJobData {
  title: string;
  company: string;
  location: string;
  experienceLevel?: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string;
  isRemote?: boolean;
  postedDate: string;
  expiryDate: string;
  skills?: string[];
  id: string;
}

/**
 * Generate TalentXcel blueprint URL: /jobs/<role>-<experience>-<location>
 */
export const generateTalentXcelJobSlug = (job: TalentXcelJobData): string => {
  const role = slugify(job.title);
  const experience = job.experienceLevel ? slugify(job.experienceLevel) : 'fresher';
  const location = slugify(job.location);
  
  // TalentXcel blueprint format: role-experience-location
  return `${role}-${experience}-${location}`;
};

/**
 * Generate TalentXcel meta title: <Job Title> | TalentXcel
 */
export const generateTalentXcelTitle = (job: TalentXcelJobData): string => {
  const title = `${job.title} | TalentXcel`;
  
  // Keep under 60 characters for optimal SEO
  if (title.length <= 60) {
    return title;
  }
  
  // Fallback: truncate job title
  const maxTitleLength = 60 - ' | TalentXcel'.length;
  return `${job.title.substring(0, maxTitleLength)}... | TalentXcel`;
};

/**
 * Generate TalentXcel meta description: Apply for <Job Title> at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!
 */
export const generateTalentXcelDescription = (job: TalentXcelJobData): string => {
  const baseDescription = `Apply for ${job.title} at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!`;
  
  // Keep under 160 characters
  if (baseDescription.length <= 160) {
    return baseDescription;
  }
  
  // Fallback: shorter version
  return `Apply for ${job.title} at TalentXcel. Excellent learning and career growth opportunities. Apply today!`;
};

/**
 * Generate TalentXcel JobPosting structured data following exact blueprint specifications
 */
export const generateTalentXcelJobStructuredData = (job: TalentXcelJobData) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.postedDate,
    "validThrough": `${job.expiryDate}T23:59`, // Exact blueprint format
    "employmentType": mapEmploymentType(job.employmentType),
    "hiringOrganization": {
      "@type": "Organization",
      "name": "TalentXcel Services", // Exact blueprint name
      "sameAs": "https://talentxcel.in" // Exact blueprint URL
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    }
  };

  // Add optional salary information
  if (job.salaryMin || job.salaryMax) {
    (structuredData as any).baseSalary = {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        ...(job.salaryMin && { "minValue": job.salaryMin }),
        ...(job.salaryMax && { "maxValue": job.salaryMax }),
        "unitText": "YEAR"
      }
    };
  }

  // Add remote work specification
  if (job.isRemote) {
    (structuredData as any).jobLocationType = "TELECOMMUTE";
  }

  // Add skills if available
  if (job.skills && job.skills.length > 0) {
    (structuredData as any).skills = job.skills.join(', ');
  }

  return structuredData;
};

/**
 * Map employment types to Google Jobs standard
 */
function mapEmploymentType(type?: string): string {
  if (!type) return 'FULL_TIME';
  
  const lowerType = type.toLowerCase();
  if (lowerType.includes('full')) return 'FULL_TIME';
  if (lowerType.includes('part')) return 'PART_TIME';
  if (lowerType.includes('contract')) return 'CONTRACTOR';
  if (lowerType.includes('intern')) return 'INTERN';
  if (lowerType.includes('temporary')) return 'TEMPORARY';
  
  return 'FULL_TIME'; // Default
}

/**
 * Generate category page data following TalentXcel blueprint
 */
export const generateCategoryPageData = (category: string) => {
  const categoryMap: Record<string, any> = {
    'it-jobs': {
      title: 'IT Jobs | TalentXcel',
      description: 'Apply for IT Jobs at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!',
      h1: 'IT Jobs',
      keywords: ['it jobs', 'software jobs', 'programming jobs', 'tech jobs', 'fresher it jobs']
    },
    'engineering-jobs': {
      title: 'Engineering Jobs | TalentXcel',
      description: 'Apply for Engineering Jobs at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!',
      h1: 'Engineering Jobs',
      keywords: ['engineering jobs', 'mechanical jobs', 'civil jobs', 'electrical jobs', 'fresher engineering jobs']
    },
    'marketing-jobs': {
      title: 'Marketing Jobs | TalentXcel',
      description: 'Apply for Marketing Jobs at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!',
      h1: 'Marketing Jobs',
      keywords: ['marketing jobs', 'digital marketing jobs', 'sales jobs', 'fresher marketing jobs']
    }
  };

  return categoryMap[category] || categoryMap['it-jobs'];
};

/**
 * Generate location page data following TalentXcel blueprint
 */
export const generateLocationPageData = (location: string) => {
  const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1);
  
  return {
    title: `${formattedLocation} Jobs | TalentXcel`,
    description: `Apply for ${formattedLocation} Jobs at TalentXcel. Great learning opportunities, growth, and skill development. Apply now!`,
    h1: `${formattedLocation} Jobs`,
    keywords: [`${location} jobs`, `jobs in ${location}`, `${location} careers`, `fresher jobs ${location}`]
  };
};

/**
 * Generate breadcrumb structured data for TalentXcel pages
 */
export const generateTalentXcelBreadcrumbs = (breadcrumbPath: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbPath.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://talentxcel.in${crumb.url}`
    }))
  };
};

/**
 * Generate FAQ structured data for TalentXcel pages
 */
export const generateTalentXcelFAQs = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org/",
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
};

/**
 * Utility function to create SEO-friendly slugs
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate XML sitemap for TalentXcel job categories and locations
 */
export const generateTalentXcelSitemap = () => {
  const baseUrl = 'https://talentxcel.in';
  const now = new Date().toISOString();
  
  const pages = [
    // Category pages
    { url: `${baseUrl}/jobs/it-jobs`, priority: 0.8, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/engineering-jobs`, priority: 0.8, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/marketing-jobs`, priority: 0.8, changefreq: 'daily' },
    
    // Location pages
    { url: `${baseUrl}/jobs/bangalore`, priority: 0.8, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/mumbai`, priority: 0.8, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/delhi`, priority: 0.8, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/hyderabad`, priority: 0.7, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/chennai`, priority: 0.7, changefreq: 'daily' },
    { url: `${baseUrl}/jobs/pune`, priority: 0.7, changefreq: 'daily' }
  ];

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const xmlFooter = '</urlset>';
  
  const xmlUrls = pages.map(page => `  <url>\n    <loc>${page.url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`).join('\n');


  return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
};

/**
 * Validate job data against TalentXcel SEO requirements
 */
export const validateTalentXcelJobSEO = (job: Partial<TalentXcelJobData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!job.title || job.title.length < 5) {
    errors.push('Job title must be at least 5 characters long');
  }

  if (!job.company || job.company.length < 2) {
    errors.push('Company name is required');
  }

  if (!job.location || job.location.length < 2) {
    errors.push('Location is required');
  }

  if (!job.description || job.description.length < 50) {
    errors.push('Job description must be at least 50 characters long');
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
