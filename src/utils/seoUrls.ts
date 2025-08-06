// ============= SEO URL UTILITIES =============
// Utilities for generating and parsing SEO-friendly URLs

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const generateJobSlug = (title: string, company: string, location?: string, jobCode?: string): string => {
  const parts = [];
  
  // Add title (required)
  if (title) {
    parts.push(slugify(title));
  }
  
  // Add job code if available (like GOV0004)
  if (jobCode) {
    parts.push(slugify(jobCode));
  }
  
  // Add company name (required) 
  if (company) {
    parts.push(slugify(company));
  }
  
  // Add location (fallback to 'india')
  const locationSlug = location ? slugify(location) : 'india';
  parts.push(locationSlug);
  
  return parts.filter(part => part.length > 0).join('-');
};

export const parseJobSlug = (slug: string): { titleSlug: string; locationSlug: string; id: string } => {
  const parts = slug.split('-');
  
  // Last part should be the 8-character ID or numeric ID
  const id = parts[parts.length - 1];
  
  // If last part looks like an ID (8 alphanumeric characters OR numbers)
  if ((id.length === 8 && /^[a-f0-9]{8}$/i.test(id)) || /^\d+$/.test(id)) {
    const remainingParts = parts.slice(0, -1);
    
    // Find location part (common location names)
    const locationKeywords = [
      'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 
      'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur',
      'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna',
      'vadodara', 'ghaziabad', 'remote', 'india'
    ];
    
    let locationIndex = -1;
    for (let i = remainingParts.length - 1; i >= 0; i--) {
      if (locationKeywords.includes(remainingParts[i])) {
        locationIndex = i;
        break;
      }
    }
    
    if (locationIndex > 0) {
      return {
        titleSlug: remainingParts.slice(0, locationIndex).join('-'),
        locationSlug: remainingParts[locationIndex],
        id: id
      };
    } else {
      // Assume last part before ID is location
      return {
        titleSlug: remainingParts.slice(0, -1).join('-'),
        locationSlug: remainingParts[remainingParts.length - 1] || 'india',
        id: id
      };
    }
  }
  
  // Fallback: assume it's all title
  return {
    titleSlug: slug,
    locationSlug: 'india',
    id: ''
  };
};

export const isValidJobSlug = (slug: string): boolean => {
  // Check if it's a UUID (36 chars with dashes)
  if (slug.length === 36 && slug.includes('-')) {
    return false; // This is a UUID, not a slug
  }
  
  // If it contains multiple dashes and looks like a slug, treat it as valid
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Valid if it ends with 8-character hex ID, numeric ID, or is a multi-part slug
  return (lastPart.length === 8 && /^[a-f0-9]{8}$/i.test(lastPart)) || 
         /^\d+$/.test(lastPart) || 
         (parts.length >= 3 && parts.every(part => part.length > 0));
};

export const getJobDetailUrl = (job: any): string => {
  if (job.seo_slug) {
    return `/jobs/${job.seo_slug}`;
  }
  
  // Fallback: generate slug on the fly using new format
  const jobCode = extractJobCodeFromTitle(job.title);
  const slug = generateJobSlug(job.title, job.company_name || job.companies?.name, job.location, jobCode);
  return `/jobs/${slug}`;
};

// Extract job code from job title (e.g., "Data Scientist - GOV0004" -> "GOV0004")
export const extractJobCodeFromTitle = (title: string): string | undefined => {
  const codeMatch = title.match(/([A-Z]{2,}\d{3,})/);
  return codeMatch ? codeMatch[1] : undefined;
};

// Convert old UUID URL to new SEO URL  
export const convertLegacyJobUrl = (jobId: string, title?: string, company?: string, location?: string): string => {
  if (title && company) {
    const jobCode = extractJobCodeFromTitle(title);
    const slug = generateJobSlug(title, company, location, jobCode);
    return `/jobs/${slug}`;
  }
  
  // If no title available, return old format (will be handled by redirect)
  return `/jobs/${jobId}`;
};

// Extract UUID from various URL formats
export const extractJobId = (slugOrId: string): string => {
  // If it's already a UUID
  if (slugOrId.length === 36 && slugOrId.includes('-')) {
    return slugOrId;
  }
  
  // If it's a slug, extract the ID part
  const parsed = parseJobSlug(slugOrId);
  if (parsed.id) {
    // If it's a numeric ID, we need to find the job by SEO slug instead
    if (/^\d+$/.test(parsed.id)) {
      return slugOrId; // Return the full slug for lookup
    }
    return parsed.id;
  }
  
  // Try to find UUID pattern in the string
  const uuidMatch = slugOrId.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (uuidMatch) {
    return uuidMatch[0];
  }
  
  // Return as-is if no UUID found
  return slugOrId;
};

// Company URL utilities
export const generateCompanySlug = (name: string, id?: string): string => {
  const nameSlug = slugify(name);
  const shortId = id ? id.substring(0, 8) : '';
  
  return `${nameSlug}${shortId ? `-${shortId}` : ''}`;
};

export const getCompanyDetailUrl = (company: any): string => {
  if (company.seo_slug) {
    return `/companies/${company.seo_slug}`;
  }
  
  const slug = generateCompanySlug(company.name, company.id);
  return `/companies/${slug}`;
};

// Generate canonical URLs
export const getCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://talentxcel.in';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// SEO-friendly pagination URLs
export const getPaginationUrl = (basePath: string, page: number, filters?: Record<string, string>): string => {
  const url = new URL(`https://talentxcel.in${basePath}`);
  
  if (page > 1) {
    url.searchParams.set('page', page.toString());
  }
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.pathname + url.search;
};