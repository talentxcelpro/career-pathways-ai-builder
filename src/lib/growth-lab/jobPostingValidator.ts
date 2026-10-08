// src/lib/growth-lab/jobPostingValidator.ts
// TalentXcel Google for Jobs Individual JobPosting Validator & Eligibility Engine
// Enforces official Google Search specifications:
// 1. Single JobPosting schema on individual job pages only (never on search/list pages).
// 2. Strict validation of title, description, datePosted, validThrough, hiringOrganization, jobLocation.
// 3. Direct application URL & canonical integrity.

import { GoogleJobValidationResult } from './types';

export interface RawJobEntity {
  id: string;
  title: string;
  description?: string;
  company_name: string;
  location?: string;
  is_remote?: boolean;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  posted_at?: string;
  created_at?: string;
  expires_at?: string;
  external_url?: string;
  is_active?: boolean;
  seo_slug?: string;
}

export class JobPostingValidator {
  public static validate(job: RawJobEntity, siteBaseUrl: string = 'https://talentxcel.in'): GoogleJobValidationResult {
    const errors: string[] = [];

    // 1. Title validation
    if (!job.title || job.title.trim().length < 3) {
      errors.push('Missing or invalid job title');
    }

    // 2. Description validation (Google requires substantive job description)
    if (!job.description || job.description.trim().length < 50) {
      errors.push('Job description must contain at least 50 characters of substantive detail');
    }

    // 3. Hiring Organization validation
    if (!job.company_name || job.company_name.trim().length < 2) {
      errors.push('Hiring organization (company_name) is required');
    }

    // 4. Location & Remote status validation
    const hasLocation = !!(job.location && job.location.trim().length > 2);
    const isRemote = job.is_remote === true;
    if (!hasLocation && !isRemote) {
      errors.push('Job must specify either a physical jobLocation or applicantLocationRequirements (is_remote)');
    }

    // 5. DatePosted & Expiration Lifecycle
    const postedDate = job.posted_at || job.created_at || new Date().toISOString();
    const hasValidDates = !!postedDate && !isNaN(new Date(postedDate).getTime());
    let isExpired = false;

    if (job.expires_at) {
      const expTime = new Date(job.expires_at).getTime();
      if (!isNaN(expTime) && Date.now() > expTime) {
        isExpired = true;
        errors.push('Job posting has expired (validThrough date in the past)');
      }
    }

    if (job.is_active === false) {
      isExpired = true;
      errors.push('Job is flagged inactive in database');
    }

    // 6. Application Route
    const slug = job.seo_slug || job.id;
    const canonicalUrl = `${siteBaseUrl}/jobs/${slug}`;
    const applyUrl = job.external_url || `${siteBaseUrl}/jobs/${slug}/apply`;
    const hasApplyUrl = !!applyUrl;

    // 7. Salary validation
    const hasSalary = !!(job.salary_min && job.salary_min > 0);

    const isValidForGoogleJobs = errors.length === 0 && !isExpired;

    return {
      jobId: job.id,
      canonicalUrl,
      title: job.title,
      companyName: job.company_name,
      location: job.location || (isRemote ? 'Remote' : 'India'),
      hasJobPostingSchema: true,
      hasValidDates,
      datePosted: postedDate,
      validThrough: job.expires_at,
      hasSalary,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: job.salary_currency || 'INR',
      hasApplyUrl,
      applyUrl,
      isExpired,
      isValidForGoogleJobs,
      errors,
    };
  }

  public static validateBatch(jobs: RawJobEntity[], siteBaseUrl?: string): {
    totalAudited: number;
    eligibleForGoogleJobs: number;
    ineligibleCount: number;
    withSalaryCount: number;
    withRemoteCount: number;
    results: GoogleJobValidationResult[];
    commonErrors: Record<string, number>;
  } {
    const results = jobs.map(j => this.validate(j, siteBaseUrl));
    const eligibleForGoogleJobs = results.filter(r => r.isValidForGoogleJobs).length;
    const withSalaryCount = results.filter(r => r.hasSalary).length;
    const withRemoteCount = jobs.filter(j => j.is_remote).length;
    const commonErrors: Record<string, number> = {};

    results.forEach(r => {
      r.errors.forEach(e => {
        commonErrors[e] = (commonErrors[e] || 0) + 1;
      });
    });

    return {
      totalAudited: jobs.length,
      eligibleForGoogleJobs,
      ineligibleCount: jobs.length - eligibleForGoogleJobs,
      withSalaryCount,
      withRemoteCount,
      results,
      commonErrors,
    };
  }

  // Generates JSON-LD JobPosting schema strictly conforming to schema.org & Google spec
  public static generateJsonLd(job: RawJobEntity, siteBaseUrl: string = 'https://talentxcel.in') {
    const validation = this.validate(job, siteBaseUrl);
    if (!validation.isValidForGoogleJobs) {
      return null;
    }

    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      'title': job.title,
      'description': job.description,
      'identifier': {
        '@type': 'PropertyValue',
        'name': 'TalentXcel',
        'value': job.id,
      },
      'datePosted': validation.datePosted,
      'validThrough': validation.validThrough || new Date(Date.now() + 30 * 86400000).toISOString(),
      'employmentType': (job.employment_type || 'FULL_TIME').toUpperCase().replace('-', '_'),
      'hiringOrganization': {
        '@type': 'Organization',
        'name': job.company_name,
        'sameAs': siteBaseUrl,
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': job.location || 'India',
          'addressCountry': 'IN',
        },
      },
      'directApply': true,
      'url': validation.canonicalUrl,
    };

    if (job.is_remote) {
      jsonLd.jobLocationType = 'TELECOMMUTE';
      jsonLd.applicantLocationRequirements = {
        '@type': 'Country',
        'name': 'India',
      };
    }

    if (validation.hasSalary) {
      jsonLd.baseSalary = {
        '@type': 'MonetaryAmount',
        'currency': validation.salaryCurrency,
        'value': {
          '@type': 'QuantitativeValue',
          'minValue': validation.salaryMin,
          'maxValue': validation.salaryMax || validation.salaryMin,
          'unitText': 'YEAR',
        },
      };
    }

    return jsonLd;
  }
}
