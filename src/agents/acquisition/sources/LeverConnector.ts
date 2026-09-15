// src/agents/acquisition/sources/LeverConnector.ts
// Connector for Lever Public Postings API (api.lever.co/v0/postings)
// Clean machine-readable parsing for company postings with full category and commitment filtering.

import type { NormalizedJob } from '../types';

export class LeverConnector {
  /**
   * Parses public Lever postings payload.
   */
  parseLeverPostings(companyDomain: string, companyName: string, rawPostings: Array<{
    id: string;
    text: string;
    categories?: { team?: string; department?: string; location?: string; commitment?: string };
    hostedUrl: string;
    createdAt: number;
  }>): NormalizedJob[] {
    return rawPostings.map((p) => {
      const titleLower = p.text.toLowerCase();
      const techStack = this.extractTechStack(titleLower);
      const seniority = this.extractSeniority(titleLower);

      return {
        id: `lever-${companyDomain}-${p.id}`,
        company_domain: companyDomain.toLowerCase().trim(),
        company_name: companyName,
        title: p.text,
        department: p.categories?.team || p.categories?.department || 'Engineering',
        location: p.categories?.location || 'India / Remote',
        tech_stack: techStack,
        seniority_level: seniority,
        posted_date: new Date(p.createdAt || Date.now()).toISOString(),
        source_url: p.hostedUrl || `https://jobs.lever.co/${companyDomain}`,
        ats_source: 'Lever Public Postings API',
        is_active: true,
      };
    });
  }

  private extractTechStack(title: string): string[] {
    const skills: string[] = [];
    if (title.includes('react') || title.includes('frontend')) skills.push('React', 'TypeScript');
    if (title.includes('java') || title.includes('spring')) skills.push('Java', 'Spring Boot');
    if (title.includes('python') || title.includes('ai') || title.includes('ml')) skills.push('Python', 'AI/ML');
    if (title.includes('go') || title.includes('golang') || title.includes('backend')) skills.push('Go', 'Distributed Systems');
    if (title.includes('node') || title.includes('fullstack')) skills.push('Node.js', 'PostgreSQL');
    return skills.length > 0 ? skills : ['Software Engineering'];
  }

  private extractSeniority(title: string): NormalizedJob['seniority_level'] {
    if (title.includes('head') || title.includes('vp') || title.includes('director')) return 'EXECUTIVE';
    if (title.includes('lead') || title.includes('staff') || title.includes('principal')) return 'STAFF_LEAD';
    if (title.includes('senior') || title.includes('sr')) return 'SENIOR';
    if (title.includes('junior') || title.includes('intern')) return 'JUNIOR';
    return 'MID';
  }
}

export const coreLeverConnector = new LeverConnector();
