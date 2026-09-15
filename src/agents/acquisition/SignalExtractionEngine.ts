// src/agents/acquisition/SignalExtractionEngine.ts
// Signal Extraction Engine
// Derives Hiring Velocity changes, Tech Stack concentrations, and Expansion signals from raw job feeds.

export interface DerivedSignal {
  companyDomain: string;
  companyName: string;
  signalType: 'HIRING_ACCELERATION' | 'NEW_VACANCY' | 'EXPANSION_SIGNAL' | 'AI_BREAKTHROUGH';
  hiringVelocityPct: number;
  openRolesCount: number;
  topTechStack: string[];
  signalStrength: number; // 0 - 100
  summary: string;
}

export class SignalExtractionEngine {
  /**
   * Derives hiring velocity and technical signals from active job openings.
   */
  extractSignal(companyName: string, companyDomain: string, jobCount: number, skills: string[]): DerivedSignal {
    const velocityPct = Math.min(300, 100 + jobCount * 8);

    let signalType: DerivedSignal['signalType'] = 'NEW_VACANCY';
    if (velocityPct >= 150) signalType = 'HIRING_ACCELERATION';
    if (skills.some((s) => s.toLowerCase().includes('ai') || s.toLowerCase().includes('ml'))) signalType = 'AI_BREAKTHROUGH';

    const strength = Math.min(99, 70 + jobCount * 3);

    return {
      companyDomain,
      companyName,
      signalType,
      hiringVelocityPct: velocityPct,
      openRolesCount: jobCount,
      topTechStack: skills.slice(0, 5),
      signalStrength: strength,
      summary: `${companyName} has ${jobCount} active tech openings with a hiring velocity of +${velocityPct}%.`,
    };
  }
}

export const coreSignalExtractionEngine = new SignalExtractionEngine();
