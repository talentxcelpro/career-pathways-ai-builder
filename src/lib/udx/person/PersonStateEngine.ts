/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Person State Engine
 * 
 * Computes readiness, capability gaps, and constraint feasibility
 * between a PersonContext and target state prerequisites.
 */

import { PersonContext } from './PersonContext';
import { UDXIntent } from '../core/IntentTypes';

export interface StateGapAssessment {
  readinessScore: number; // 0 to 1
  isFeasible: boolean;
  missingPrerequisites: string[];
  matchedCapabilities: string[];
  violatedHardConstraints: string[];
  recommendationNote: string;
}

export class PersonStateEngine {
  public static evaluateGap(
    person: PersonContext,
    targetPrerequisites: string[],
    intent: UDXIntent
  ): StateGapAssessment {
    const matchedCapabilities: string[] = [];
    const missingPrerequisites: string[] = [];
    const violatedHardConstraints: string[] = [];

    const personCapabilityNames = new Set(
      person.capabilities.map(c => c.name.toLowerCase().trim())
    );

    targetPrerequisites.forEach(prereq => {
      const cleanPrereq = prereq.toLowerCase().trim();
      const isMatched = Array.from(personCapabilityNames).some(c => 
        c.includes(cleanPrereq) || cleanPrereq.includes(c)
      );

      if (isMatched) {
        matchedCapabilities.push(prereq);
      } else {
        missingPrerequisites.push(prereq);
      }
    });

    // Check location constraint
    if (intent.location?.mobility === 'LOCAL_ONLY') {
      const targetLoc = intent.location.primaryLocation?.toLowerCase();
      const personLoc = person.location.primaryLocation?.toLowerCase();
      if (targetLoc && personLoc && !personLoc.includes(targetLoc) && !targetLoc.includes(personLoc)) {
        violatedHardConstraints.push(`Geographic restriction: requires presence in ${intent.location.primaryLocation}`);
      }
    }

    const totalReq = targetPrerequisites.length;
    const readinessScore = totalReq > 0 
      ? parseFloat((matchedCapabilities.length / totalReq).toFixed(2))
      : 1.0;

    const isFeasible = violatedHardConstraints.length === 0 && readinessScore >= 0.5;

    return {
      readinessScore,
      isFeasible,
      missingPrerequisites,
      matchedCapabilities,
      violatedHardConstraints,
      recommendationNote: isFeasible
        ? 'High structural feasibility; proceed to Possibility Graph path resolution.'
        : `Bridging pathway required: ${missingPrerequisites.length} prerequisite capabilities missing.`,
    };
  }
}
