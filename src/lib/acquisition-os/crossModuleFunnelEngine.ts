// src/lib/acquisition-os/crossModuleFunnelEngine.ts
// Cross-Module Unified User Journey & Conversion Routing Engine
// Moves organic Google search visitors across complementary TalentXcel surfaces

import { 
  ALL_12_ACQUISITION_SURFACES, 
  type AcquisitionSurfaceId, 
  type AcquisitionSurfaceMeta, 
  type CrossModuleJourneyStep 
} from './types';

export { ALL_12_ACQUISITION_SURFACES };

export const ACQUISITION_SURFACE_REGISTRY: Record<AcquisitionSurfaceId, AcquisitionSurfaceMeta> = {
  JOBS: {
    id: 'JOBS',
    name: 'Global Job Postings & Local Hubs',
    baseUrl: '/jobs',
    primaryIntent: 'TRANSACTIONAL',
    targetAudience: 'JOB_SEEKERS',
    crossModuleNextSteps: ['RESUME_BUILDER', 'LEARNING', 'NETWORK'],
  },
  EMPLOYER: {
    id: 'EMPLOYER',
    name: 'Employer Multi-Location Ingestion & Hiring',
    baseUrl: '/hire',
    primaryIntent: 'COMMERCIAL',
    targetAudience: 'EMPLOYERS',
    crossModuleNextSteps: ['COMPANIES', 'NETWORK', 'JOBS'],
  },
  COMPANIES: {
    id: 'COMPANIES',
    name: 'Company Profiles & Hiring Intelligence',
    baseUrl: '/companies',
    primaryIntent: 'INFORMATIONAL',
    targetAudience: 'JOB_SEEKERS',
    crossModuleNextSteps: ['JOBS', 'CAREER_TOOLS', 'NETWORK'],
  },
  RANKINGS: {
    id: 'RANKINGS',
    name: 'Claim #1 Leaderboards & Industry Rankings',
    baseUrl: '/rankings',
    primaryIntent: 'COMMERCIAL',
    targetAudience: 'EMPLOYERS',
    crossModuleNextSteps: ['COMPANIES', 'EMPLOYER'],
  },
  RESUME_BUILDER: {
    id: 'RESUME_BUILDER',
    name: 'AI Resume Studio & Instant ATS Scanner',
    baseUrl: '/resume',
    primaryIntent: 'TRANSACTIONAL',
    targetAudience: 'JOB_SEEKERS',
    crossModuleNextSteps: ['JOBS', 'CAREER_PASSPORT', 'NETWORK'],
  },
  CAREER_TOOLS: {
    id: 'CAREER_TOOLS',
    name: 'Salary Calculators & Career Assessment Tools',
    baseUrl: '/tools',
    primaryIntent: 'INFORMATIONAL',
    targetAudience: 'PROFESSIONALS',
    crossModuleNextSteps: ['RESUME_BUILDER', 'JOBS', 'CAREER_MAP'],
  },
  SERVICES: {
    id: 'SERVICES',
    name: 'Career Coaching & Executive Optimization',
    baseUrl: '/services',
    primaryIntent: 'COMMERCIAL',
    targetAudience: 'PROFESSIONALS',
    crossModuleNextSteps: ['RESUME_BUILDER', 'NETWORK'],
  },
  LEARNING: {
    id: 'LEARNING',
    name: 'Upskilling Courses & Skill Verification',
    baseUrl: '/learning',
    primaryIntent: 'EDUCATIONAL' as any,
    targetAudience: 'STUDENTS',
    crossModuleNextSteps: ['CAREER_PASSPORT', 'JOBS'],
  },
  COLLEGES: {
    id: 'COLLEGES',
    name: 'Global Degree Programs & Free Scholarships',
    baseUrl: '/colleges',
    primaryIntent: 'EDUCATIONAL' as any,
    targetAudience: 'STUDENTS',
    crossModuleNextSteps: ['CAREER_MAP', 'LEARNING', 'JOBS'],
  },
  CAREER_MAP: {
    id: 'CAREER_MAP',
    name: 'Career Progression Pathways & Roadmaps',
    baseUrl: '/career-map',
    primaryIntent: 'INFORMATIONAL',
    targetAudience: 'PROFESSIONALS',
    crossModuleNextSteps: ['LEARNING', 'JOBS', 'NETWORK'],
  },
  CAREER_PASSPORT: {
    id: 'CAREER_PASSPORT',
    name: 'Living Verified Identity & Professional Passport',
    baseUrl: '/passport',
    primaryIntent: 'NAVIGATIONAL',
    targetAudience: 'PROFESSIONALS',
    crossModuleNextSteps: ['NETWORK', 'JOBS'],
  },
  NETWORK: {
    id: 'NETWORK',
    name: 'Professional Network, Peers & Mentorship',
    baseUrl: '/network',
    primaryIntent: 'NAVIGATIONAL',
    targetAudience: 'PROFESSIONALS',
    crossModuleNextSteps: ['JOBS', 'COMPANIES', 'CAREER_PASSPORT'],
  },
};

/**
 * Resolves the optimal next cross-module funnel steps for any visitor landing surface
 */
export function resolveCrossModuleFunnel(
  entrySurface: AcquisitionSurfaceId,
  context?: { role?: string; city?: string }
): CrossModuleJourneyStep[] {
  const meta = ACQUISITION_SURFACE_REGISTRY[entrySurface] || ACQUISITION_SURFACE_REGISTRY.JOBS;
  const steps: CrossModuleJourneyStep[] = [];

  const roleText = context?.role ? ` for ${context.role.replace(/-/g, ' ')}` : '';
  const cityText = context?.city ? ` in ${context.city.replace(/-/g, ' ')}` : '';

  let idx = 1;
  for (const nextId of meta.crossModuleNextSteps) {
    const nextMeta = ACQUISITION_SURFACE_REGISTRY[nextId];
    if (!nextMeta) continue;

    let cta = `Explore ${nextMeta.name}`;
    let path = nextMeta.baseUrl;

    if (nextId === 'RESUME_BUILDER') {
      cta = `Scan Resume Free${roleText}`;
      path = '/resume/ats-scanner';
    } else if (nextId === 'JOBS') {
      cta = `View Verified Jobs${cityText}`;
      path = context?.city ? `/jobs/${context.city}` : '/jobs';
    } else if (nextId === 'LEARNING') {
      cta = `Explore Missing Skill Certifications`;
      path = '/learning';
    } else if (nextId === 'CAREER_MAP') {
      cta = `View Career Progression Roadmap`;
      path = '/career-map';
    } else if (nextId === 'NETWORK') {
      cta = `Connect with Verified Professionals`;
      path = '/network';
    }

    steps.push({
      stepIndex: idx++,
      surfaceId: nextId,
      title: nextMeta.name,
      urlPath: path,
      callToAction: cta,
      conversionValue: idx === 2 ? 'HIGH' : idx === 3 ? 'MAXIMAL' : 'MEDIUM',
    });
  }

  return steps;
}
