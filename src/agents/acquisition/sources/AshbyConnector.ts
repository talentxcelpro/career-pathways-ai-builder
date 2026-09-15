// src/agents/acquisition/sources/AshbyConnector.ts
// Connector for Ashby Public Job Postings API
// Ingests structured job listings, compensation ranges, and locations without authentication.

import type { NormalizedJob } from '../types';

export class AshbyConnector {
  /**
   * Parses public Ashby job board payloads.
   */
  parseAshbyJobs(companyDomain: string, companyName: string, rawJobs: Array<{
    id: string;
    title: string;
    departmentName?: string;
    locationName?: string;
    jobUrl?: string;
    publishedAt?: string;
  }>): NormalizedJob[] {
    const now = new Date().toISOString();

    return rawJobs.map((j) => {
      const titleLower = j.title.toLowerCase();
      const techStack = this.extractTechStack(titleLower);

      return {
        id: `ashby-${companyDomain}-${j.id}`,
        company_domain: companyDomain.toLowerCase().trim(),
        company_name: companyName,
        title: j.title,
        department: j.departmentName || 'Engineering',
        location: j.locationName || 'Remote / India',
        tech_stack: techStack,
        seniority_level: this.extractSeniority(titleLower),
        posted_date: j.publishedAt || now,
        source_url: j.jobUrl || `https://jobs.ashbyhq.com/${companyDomain}`,
        ats_source: 'Ashby Public Jobs API',
        is_active: true,
      };
    });
  }

  private extractTechStack(title: string): string[] {
    const skills: string[] = [];
    if (title.includes('react') || title.includes('frontend')) skills.push('React', 'TypeScript');
    if (title.includes('python') || title.includes('ai') || title.includes('ml')) skills.push('Python', 'PyTorch', 'LLMs');
    if (title.includes('c++') || title.includes('rust') || title.includes('systems')) skills.push('C++', 'Rust', 'Low Latency');
    if (title.includes('fullstack')) skills.push('Next.js', 'PostgreSQL', 'Node.js');
    return skills.length > 0 ? skills : ['Software Engineering'];
  }

  private extractSeniority(title: string): NormalizedJob['seniority_level'] {
    if (title.includes('founder') || title.includes('founding')) return 'STAFF_LEAD';
    if (title.includes('lead') || title.includes('staff')) return 'STAFF_LEAD';
    if (title.includes('senior') || title.includes('sr')) return 'SENIOR';
    return 'MID';
  }
}

export const coreAshbyConnector = new AshbyConnector();
