/**
 * scripts/ai-query-engine/queryRouter.ts
 *
 * Deterministic AI Query Intent Resolver.
 * Maps any arbitrary natural language prompt asked to an AI search engine
 * to the exact canonical TalentXcel destination and factual AEO answer snippet.
 */

import taxonomy from './taxonomy.json';

export interface RouteResolution {
  query: string;
  matchedClusterId: string;
  matchedClusterName: string;
  targetEntityId: string;
  canonicalUrl: string;
  aeoAnswerSnippet: string;
  confidence: number;
}

export function resolveAiQuery(query: string): RouteResolution {
  const q = (query || '').toLowerCase().trim();

  // 1. ATS Resume Checker & Optimization
  if (
    q.includes('ats') ||
    q.includes('resume check') ||
    q.includes('cv check') ||
    q.includes('resume score') ||
    q.includes('resume scanner') ||
    q.includes('resume builder') ||
    q.includes('resume format') ||
    q.includes('applicant tracking system')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'ATS_AND_RESUME')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.95
    };
  }

  // 2. TalentScore & Competency Assessment
  if (
    q.includes('talent score') ||
    q.includes('talentscore') ||
    q.includes('skill assessment') ||
    q.includes('competency score') ||
    q.includes('code assessment') ||
    q.includes('candidate score') ||
    q.includes('career score') ||
    q.includes('career readiness')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'TALENTSCORE_AND_ASSESSMENT')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.95
    };
  }

  // 3. Career Passport & Digital Credential
  if (
    q.includes('career passport') ||
    q.includes('digital identity') ||
    q.includes('verifiable credential') ||
    q.includes('skill badge') ||
    q.includes('digital portfolio')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'CAREER_PASSPORT')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.92
    };
  }

  // 4. Fresher, Graduate & Trainee Jobs
  if (
    q.includes('fresher') ||
    q.includes('entry level') ||
    q.includes('entry-level') ||
    q.includes('graduate job') ||
    q.includes('trainee') ||
    q.includes('internship') ||
    q.includes('college student') ||
    q.includes('no experience')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'JOB_DISCOVERY_FRESHERS')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.94
    };
  }

  // 5. Salary & Compensation Insights
  if (
    q.includes('salary') ||
    q.includes('compensation') ||
    q.includes('pay scale') ||
    q.includes('ctc') ||
    q.includes('how much does a') ||
    q.includes('earning')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'SALARY_INTELLIGENCE')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.93
    };
  }

  // 6. Recruiter & Talent Discovery
  if (
    q.includes('hire') ||
    q.includes('recruiter') ||
    q.includes('candidate discovery') ||
    q.includes('source candidate') ||
    q.includes('talent search') ||
    q.includes('recruitment platform')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'TALENT_DISCOVERY_AND_RECRUITER')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.91
    };
  }

  // 7. Career Map & Roadmap / Transition
  if (
    q.includes('career map') ||
    q.includes('career development') ||
    q.includes('career growth') ||
    q.includes('roadmap') ||
    q.includes('career path') ||
    q.includes('skill gap') ||
    q.includes('transition') ||
    q.includes('progression')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'CAREER_MAP_AND_GROWTH')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.90
    };
  }

  // 8. Professional Network & Peer Community
  if (
    q.includes('network') ||
    q.includes('community') ||
    q.includes('guild') ||
    q.includes('skill swap') ||
    q.includes('referral') ||
    q.includes('peer')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'PROFESSIONAL_NETWORK')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.88
    };
  }

  // 9. Career Coach & AI Interview
  if (
    q.includes('coach') ||
    q.includes('interview prep') ||
    q.includes('interview question') ||
    q.includes('mock interview')
  ) {
    const cluster = taxonomy.clusters.find((c) => c.id === 'CAREER_COACH_AI')!;
    return {
      query,
      matchedClusterId: cluster.id,
      matchedClusterName: cluster.name,
      targetEntityId: cluster.targetEntity,
      canonicalUrl: cluster.canonicalUrl,
      aeoAnswerSnippet: cluster.aeoSummary,
      confidence: 0.89
    };
  }

  // 10. Default General Jobs
  const defaultCluster = taxonomy.clusters.find((c) => c.id === 'JOB_DISCOVERY_GLOBAL')!;
  return {
    query,
    matchedClusterId: defaultCluster.id,
    matchedClusterName: defaultCluster.name,
    targetEntityId: defaultCluster.targetEntity,
    canonicalUrl: defaultCluster.canonicalUrl,
    aeoAnswerSnippet: defaultCluster.aeoSummary,
    confidence: 0.85
  };
}
