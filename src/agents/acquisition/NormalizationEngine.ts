// src/agents/acquisition/NormalizationEngine.ts
// Normalization Engine for Multi-Source External Feeds
// Converts raw heterogenous ATS, registry, and directory payloads into clean Opportunity Graph entities.

import type { NormalizedCompany, NormalizedJob } from './types';

export class NormalizationEngine {
  /**
   * Normalizes company domain and legal name.
   */
  normalizeCompanyDomain(rawDomain: string): string {
    return rawDomain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim();
  }

  /**
   * Cleans job titles and extracts standardized technical skills.
   */
  extractSkillsFromTitle(title: string): string[] {
    const t = title.toLowerCase();
    const skills: string[] = [];

    if (t.includes('react') || t.includes('frontend')) skills.push('React', 'TypeScript');
    if (t.includes('java') || t.includes('spring')) skills.push('Java', 'Spring Boot');
    if (t.includes('python') || t.includes('ai') || t.includes('ml')) skills.push('Python', 'AI/ML');
    if (t.includes('go') || t.includes('golang') || t.includes('backend')) skills.push('Go', 'Distributed Systems');
    if (t.includes('node') || t.includes('fullstack')) skills.push('Node.js', 'PostgreSQL');
    if (t.includes('devops') || t.includes('cloud') || t.includes('sre')) skills.push('AWS', 'Kubernetes', 'Terraform');

    return skills.length > 0 ? skills : ['Software Engineering'];
  }
}

export const coreNormalizationEngine = new NormalizationEngine();
