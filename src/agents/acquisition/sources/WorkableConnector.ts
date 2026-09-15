// src/agents/acquisition/sources/WorkableConnector.ts
// Connector for Workable Public Job Widget API
// Ingests structured job openings, employment types, and city locations.

import type { NormalizedJob } from '../types';

export class WorkableConnector {
  /**
   * Parses public Workable jobs payload.
   */
  parseWorkableJobs(companyDomain: string, companyName: string, rawJobs: Array<{
    shortcode: string;
    title: string;
    department?: string;
    city?: string;
    country?: string;
    url: string;
    published_on?: string;
  }>): NormalizedJob[] {
    const now = new Date().toISOString();

    return rawJobs.map((j) => {
      const titleLower = j.title.toLowerCase();

      return {
        id: `workable-${companyDomain}-${j.shortcode}`,
        company_domain: companyDomain.toLowerCase().trim(),
        company_name: companyName,
        title: j.title,
        department: j.department || 'Engineering',
        location: `${j.city || 'Bengaluru'}, ${j.country || 'India'}`,
        tech_stack: ['Software Engineering', 'Cloud Services'],
        seniority_level: titleLower.includes('senior') ? 'SENIOR' : 'MID',
        posted_date: j.published_on || now,
        source_url: j.url || `https://apply.workable.com/${companyDomain}`,
        ats_source: 'Workable Public Jobs API',
        is_active: true,
      };
    });
  }
}

export const coreWorkableConnector = new WorkableConnector();
