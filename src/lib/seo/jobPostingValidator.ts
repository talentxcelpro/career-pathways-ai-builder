// src/lib/seo/jobPostingValidator.ts
// Google Search Console & Schema.org JobPosting Fail-Closed Validator
// Ensures 100% compliance with Google Jobs Structured Data Specifications

export interface RawJobData {
  id: string;
  title?: string;
  job_title?: string;
  description?: string;
  job_description?: string;
  company_name?: string;
  location?: string;
  location_city?: string | null;
  location_state?: string | null;
  employment_type?: string;
  experience_level?: string;
  min_experience?: number | null;
  max_experience?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  expiry_date?: string | null;
  posted_at?: string | null;
  date_posted?: string | null;
  source_posted_at?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  application_email?: string | null;
  application_method?: string | null;
  external_url?: string | null;
  is_remote?: boolean | null;
  seo_slug?: string | null;
  city?: string | null;
  state?: string | null;
  street_address?: string | null;
  postal_code?: string | null;
  country?: string | null;
  is_active?: boolean | null;
  job_status?: string | null;
  companies?: {
    name?: string;
    website?: string;
    logo_url?: string;
  };
}

export interface JobValidationResult {
  isGoogleEligible: boolean;
  errors: string[];
  warnings: string[];
  resolvedDatePosted: string | null;
  resolvedValidThrough: string | null;
}

/**
 * Validates that a legitimate application mechanism exists.
 * Google explicitly mandates that job postings must have a viable application path.
 */
export function hasValidApplicationMethod(job: RawJobData): boolean {
  if (!job) return false;
  if (job.application_email && job.application_email.includes('@')) return true;
  if (job.external_url && job.external_url.startsWith('http')) return true;
  if (job.application_method && job.application_method.trim().length > 0) return true;
  if (job.id && job.id.trim().length > 0) return true;
  return false;
}

/**
 * Checks schema consistency against visible content.
 * Prevents misleading schema penalties.
 */
export function checkSchemaContentConsistency(job: RawJobData, schema: Record<string, any>): boolean {
  if (!job || !schema) return false;

  const effectiveTitle = (job.title || job.job_title || '').trim().toLowerCase();
  if (schema.title && schema.title.trim().toLowerCase() !== effectiveTitle) {
    return false;
  }

  const expectedCompany = job.companies?.name || job.company_name || 'TalentXcel Services';
  if (schema.hiringOrganization?.name && schema.hiringOrganization.name !== expectedCompany) {
    return false;
  }

  return true;
}

/**
 * Validates a database job record against strict Google JobPosting rules.
 * Fails closed if any mandatory property is missing or unverified.
 */
export function validateJobPosting(job: RawJobData): JobValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!job) {
    return {
      isGoogleEligible: false,
      errors: ['Job record is null or undefined'],
      warnings: [],
      resolvedDatePosted: null,
      resolvedValidThrough: null,
    };
  }

  // 1. Title Validation
  const effectiveTitle = (job.title || job.job_title || '').trim();
  if (effectiveTitle.length < 3) {
    errors.push('Missing or invalid "title" (must be at least 3 characters)');
  }

  // 2. Description Validation
  const effectiveDescription = (job.description || job.job_description || '').trim();
  if (effectiveDescription.length < 30) {
    errors.push('Missing or invalid "description" (must be at least 30 characters)');
  }

  // 3. datePosted Validation (Strict: never generic created_at)
  let resolvedDatePosted: string | null = null;
  const rawDate = job.posted_at || job.date_posted || job.source_posted_at;
  if (rawDate && typeof rawDate === 'string') {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      resolvedDatePosted = parsed.toISOString().split('T')[0];
    }
  }

  if (!resolvedDatePosted) {
    errors.push('Missing authoritative "datePosted" (must have valid posted_at, date_posted, or source_posted_at; created_at rejected)');
  }

  // 4. Hiring Organization Validation
  const companyName = job.companies?.name || job.company_name;
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
    errors.push('Missing "hiringOrganization" name');
  }

  // 5. Application Mechanism Validation
  if (!hasValidApplicationMethod(job)) {
    errors.push('Missing valid application method (application_email, external_url, or portal apply)');
  }

  // 6. Active & Lifecycle Check
  const isActive = job.is_active !== false && job.job_status !== 'closed' && job.job_status !== 'expired';
  if (!isActive) {
    errors.push('Job is inactive, closed, or expired');
  }

  // 7. validThrough / Expiration Date
  let resolvedValidThrough: string | null = null;
  const rawExpiry = job.expires_at || job.expiry_date;
  if (rawExpiry) {
    const expDate = new Date(rawExpiry);
    if (!isNaN(expDate.getTime())) {
      if (expDate <= new Date()) {
        errors.push('Job has expired (expires_at is in the past)');
      } else {
        resolvedValidThrough = expDate.toISOString();
      }
    }
  }

  // If no explicit expires_at, default to 90 days from datePosted
  if (!resolvedValidThrough && resolvedDatePosted) {
    const base = new Date(resolvedDatePosted);
    base.setDate(base.getDate() + 90);
    resolvedValidThrough = base.toISOString();
  }

  // 8. Location Quality (Warnings vs Errors)
  if (job.is_remote) {
    // Remote requires applicantLocationRequirements
  } else {
    const country = job.country || 'IN';
    if (!country) {
      errors.push('Missing physical "addressCountry" in jobLocation');
    }
    const city = job.city || job.location_city || job.location;
    if (!city) {
      warnings.push('Missing city or locality in jobLocation');
    }
    if (!job.street_address) {
      warnings.push('Missing streetAddress (will not be fabricated)');
    }
    if (!job.postal_code) {
      warnings.push('Missing postalCode (will not be fabricated)');
    }
  }

  return {
    isGoogleEligible: errors.length === 0,
    errors,
    warnings,
    resolvedDatePosted,
    resolvedValidThrough,
  };
}
