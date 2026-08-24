// src/agents/acquisition/sources/GreenhouseConnector.ts
// Connector for Greenhouse Public Job Board API (boards-api.greenhouse.io)
// Compliant machine-readable ingestion with zero login or anti-bot bypass.

import type { NormalizedJob } from '../types';

export class GreenhouseConnector {
  /**
   * Parses public Greenhouse job board payloads.
   */
  parseGreenhouseBoard(companyDomain: string, companyName: string, rawJobs: Array<{
    id: number | string;
    title: string;
    location?: { name: string };
    departments?: Array<{ name: string }>;
    absolute_url: string;
    updated_at: string;
  }>): NormalizedJob[] {
    const now = new Date().toISOString();

    return rawJobs.map((j) => {
      const titleLower = j.title.toLowerCase();
      const techStack = this.extractTechStack(titleLower);
      const seniority = this.extractSeniority(titleLower);

      return {
        id: `gh-${companyDomain}-${j.id}`,
        company_domain: companyDomain.toLowerCase().trim(),
        company_name: companyName,
        title: j.title,
        department: j.departments?.[0]?.name || 'Engineering',
        location: j.location?.name || 'India / Remote',
        tech_stack: techStack,
        seniority_level: seniority,
        posted_date: j.updated_at || now,
        source_url: j.absolute_url || `https://boards.greenhouse.io/${companyDomain}`,
        ats_source: 'Greenhouse Public Board API',
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
    if (title.includes('cloud') || title.includes('devops') || title.includes('sre')) skills.push('AWS', 'Kubernetes', 'Terraform');
    return skills.length > 0 ? skills : ['Software Engineering'];
  }

  private extractSeniority(title: string): NormalizedJob['seniority_level'] {
    if (title.includes('director') || title.includes('vp') || title.includes('head')) return 'EXECUTIVE';
    if (title.includes('staff') || title.includes('principal') || title.includes('lead')) return 'STAFF_LEAD';
    if (title.includes('senior') || title.includes('sr') || title.includes('sde 3') || title.includes('sde-3')) return 'SENIOR';
    if (title.includes('junior') || title.includes('intern') || title.includes('associate')) return 'JUNIOR';
    return 'MID';
  }
}

export const coreGreenhouseConnector = new GreenhouseConnector();
