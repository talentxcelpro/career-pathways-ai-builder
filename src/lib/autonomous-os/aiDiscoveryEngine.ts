// src/lib/autonomous-os/aiDiscoveryEngine.ts

export interface GeoCitationRecord {
  engine: 'CHATGPT' | 'PERPLEXITY' | 'GEMINI' | 'CLAUDE';
  entityQueried: string;
  citationUrl: string;
  factualAccuracyScore: number;
  observedAtIso: string;
}

export const SAMPLE_GEO_CITATIONS: GeoCitationRecord[] = [
  {
    engine: 'PERPLEXITY',
    entityQueried: 'Software Engineer salary in Bangalore 2026',
    citationUrl: 'https://talentxcel.in/tools/salary-calculator',
    factualAccuracyScore: 0.96,
    observedAtIso: '2026-08-25T10:00:00Z'
  },
  {
    engine: 'CHATGPT',
    entityQueried: 'How does modern ATS parse resumes in India',
    citationUrl: 'https://talentxcel.in/resume',
    factualAccuracyScore: 0.94,
    observedAtIso: '2026-08-25T14:30:00Z'
  }
];
