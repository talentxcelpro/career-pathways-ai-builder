/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * First Domain Laboratory: TalentXcel Career Adapter
 * 
 * ARCHITECTURAL INTEGRITY:
 * This adapter bridges domain-neutral UDX primitives (PersonContext, UDXIntent, PossibilityPath)
 * to career-domain concepts (Candidate, Resume, Role, Job, Compensation, ATS Score).
 * Core UDX modules NEVER import from here.
 */

import { UDXIntent, LocationContext, Constraint } from '../../core/IntentTypes';
import { PersonContext, CapabilityAsset } from '../../person/PersonContext';
import { PossibilityPath } from '../../possibility/types';

export interface CareerCandidateProfile {
  candidateId: string;
  fullName: string;
  targetRole: string;
  skills: string[];
  yearsExperience: number;
  targetSalaryLPA: number;
  atsScore?: number;
  workPreference: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'ANY';
  preferredLocations: string[];
}

export interface CareerJobListing {
  jobId: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  minSalaryLPA: number;
  maxSalaryLPA: number;
  verified: boolean;
  verificationSource: string;
  activeStatus: 'ACTIVE' | 'FILLED' | 'EXPIRED';
  postedAt: string;
  applyUrl: string;
}

export class CareerAdapter {
  /**
   * Adapts a generic PersonContext into a specialized CareerCandidateProfile.
   */
  public static toCandidateProfile(person: PersonContext): CareerCandidateProfile {
    const skills = person.capabilities
      .filter(c => c.type === 'TECHNICAL' || c.type === 'COGNITIVE')
      .map(c => c.name);

    const ext = person.domainExtensions?.career as Record<string, unknown> | undefined;

    return {
      candidateId: person.personId,
      fullName: (ext?.fullName as string) || 'Anonymous Professional',
      targetRole: (ext?.targetRole as string) || person.currentStateDescription,
      skills,
      yearsExperience: (ext?.yearsExperience as number) || 3,
      targetSalaryLPA: person.economicMinimumThreshold ? person.economicMinimumThreshold / 100000 : 18,
      atsScore: (ext?.atsScore as number) || 82,
      workPreference: (ext?.workPreference as 'REMOTE' | 'HYBRID' | 'ONSITE' | 'ANY') || 'ANY',
      preferredLocations: [person.location.city, ...(ext?.preferredLocations as string[] || [])],
    };
  }

  /**
   * Adapts a candidate profile into a domain-neutral PersonContext.
   */
  public static fromCandidateProfile(candidate: CareerCandidateProfile): PersonContext {
    const capabilities: CapabilityAsset[] = candidate.skills.map((skill, idx) => ({
      id: `cap-${idx}-${skill.toLowerCase().replace(/\s+/g, '-')}`,
      name: skill,
      type: 'TECHNICAL',
      proficiencyLevel: 0.85,
      verified: true,
      verificationSource: 'TalentXcel Resume Evaluation',
    }));

    const constraints: Constraint[] = [
      {
        type: 'ECONOMIC',
        description: `Minimum target package of ₹${candidate.targetSalaryLPA} LPA`,
        strict: true,
      },
      {
        type: 'GEOGRAPHIC',
        description: `Locations: ${candidate.preferredLocations.join(', ')} (${candidate.workPreference})`,
        strict: candidate.workPreference === 'ONSITE',
      }
    ];

    return {
      personId: candidate.candidateId,
      currentStateDescription: `Seeking ${candidate.targetRole} role with verified compensation ₹${candidate.targetSalaryLPA} LPA`,
      capabilities,
      resources: [
        {
          id: 'res-weekly-time',
          type: 'TIME_HOURS_PER_WEEK',
          value: 40,
          description: 'Full-time employment availability',
        }
      ],
      constraints,
      preferences: [
        {
          key: 'work_mode',
          value: candidate.workPreference,
          weight: 0.8,
        }
      ],
      riskTolerance: 'BALANCED',
      economicMinimumThreshold: candidate.targetSalaryLPA * 100000,
      location: {
        city: candidate.preferredLocations[0] || 'Remote',
        country: 'India',
      },
      historySummary: [`${candidate.yearsExperience} years professional experience in ${candidate.targetRole}`],
      activeCommitments: [],
      priorDecisions: [],
      lastStateUpdateAt: new Date().toISOString(),
      domainExtensions: {
        career: {
          fullName: candidate.fullName,
          targetRole: candidate.targetRole,
          yearsExperience: candidate.yearsExperience,
          atsScore: candidate.atsScore,
          workPreference: candidate.workPreference,
          preferredLocations: candidate.preferredLocations,
        }
      }
    };
  }

  /**
   * Translates a raw job search intent or query into a structured canonical UDXIntent.
   */
  public static toUDXCareerIntent(rawQuery: string, location?: string): UDXIntent {
    const loc: LocationContext = {
      city: location || (rawQuery.toLowerCase().includes('varanasi') ? 'Varanasi' : 'Bangalore'),
      country: 'India',
    };

    return {
      intentId: `intent-career-${Date.now()}`,
      canonicalIntent: `CAREER_SEARCH: ${rawQuery.toUpperCase().trim()}`,
      domain: 'CAREER',
      primaryGoal: `Attain verified role matching "${rawQuery}" with direct employer verification`,
      sourceSignals: [
        {
          signalId: `sig-${Date.now()}`,
          channel: 'SEARCH_QUERY',
          rawContent: rawQuery,
          confidence: 0.95,
          timestamp: new Date().toISOString(),
        }
      ],
      constraints: [
        {
          type: 'GEOGRAPHIC',
          description: `Localized or reachable from ${loc.city}`,
          strict: false,
        }
      ],
      entities: [
        {
          entityId: 'ent-talentxcel',
          name: 'TalentXcel Verified Network',
          type: 'ORGANIZATION',
          role: 'EXECUTION_PARTNER',
        }
      ],
      urgency: 'HIGH',
      timeframe: 'NEXT_30_DAYS',
      epistemicStatus: 'OBSERVED',
      confidence: 0.94,
    };
  }

  /**
   * Calculates career pathway ROI / salary advantage.
   */
  public static evaluatePathAdvantage(path: PossibilityPath, currentSalaryLPA: number): {
    estimatedLiftLPA: number;
    speedupDays: number;
    directEmployerAccess: boolean;
  } {
    const targetLPA = 24; // Benchmark verified median
    return {
      estimatedLiftLPA: Math.max(0, targetLPA - currentSalaryLPA),
      speedupDays: Math.max(1, 35 - path.estimatedDurationDays),
      directEmployerAccess: path.edges.some(e => e.executable && e.executionTarget?.includes('apply')),
    };
  }
}
