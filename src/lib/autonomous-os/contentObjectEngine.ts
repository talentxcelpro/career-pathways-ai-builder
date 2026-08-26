// src/lib/autonomous-os/contentObjectEngine.ts

export interface KnowledgeObjectSpec {
  objectId: string;
  entityType: 'SALARY_BENCHMARK' | 'CAREER_ROADMAP' | 'ATS_SCORECARD' | 'COLLEGE_PROGRAM';
  title: string;
  canonicalUrl: string;
  qualityScore: number; // 0-100
  isIndexableEligible: boolean;
  structuredSchemaTypes: string[];
}

export function validateKnowledgeObjectQuality(spec: KnowledgeObjectSpec): { eligible: boolean; rejectionReason?: string } {
  if (spec.qualityScore < 70) {
    return { eligible: false, rejectionReason: 'Quality score below minimum threshold (70/100)' };
  }
  if (!spec.structuredSchemaTypes || spec.structuredSchemaTypes.length === 0) {
    return { eligible: false, rejectionReason: 'Missing required JSON-LD schema definitions' };
  }
  return { eligible: true };
}
