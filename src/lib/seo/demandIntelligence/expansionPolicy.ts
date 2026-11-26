// src/lib/seo/demandIntelligence/expansionPolicy.ts
// Phase 7 & Phase 8 Intelligent Plausibility Gate & Evidence Status Model.
// Ensures large-scale candidate expansion produces ONLY valid, meaningful search intents
// without redundant loops, fake volumes, or automatic publication.

export type EvidenceStatus =
  | 'GSC_VERIFIED'
  | 'GA4_VERIFIED'
  | 'PUBLIC_SUGGEST_VERIFIED'
  | 'FIRST_PARTY_INVENTORY_BACKED'
  | 'UNKNOWN';

export interface CandidatePlausibilityInput {
  roleTitle: string;
  skillName?: string | null;
  industryName?: string | null;
  cityName?: string | null;
  regionName?: string | null;
  countryName?: string | null;
  modifier?: string | null;
}

const REDUNDANT_NOISE_PAIRS: ReadonlyArray<[string, string]> = [
  ['recruiter', 'hr'],
  ['sales', 'sales'],
  ['accountant', 'accounting'],
  ['marketing', 'marketing'],
  ['engineer', 'engineering'],
  ['developer', 'software'],
  ['teacher', 'teaching'],
  ['nurse', 'nursing'],
];

/**
 * Enforces semantic plausibility before retaining any candidate keyword in the 5M+ intelligence warehouse.
 */
export function isPlausibleCandidateCombination(input: CandidatePlausibilityInput): boolean {
  const roleLower = input.roleTitle.toLowerCase();
  const modLower = (input.modifier || '').toLowerCase();
  const skillLower = (input.skillName || '').toLowerCase();
  const indLower = (input.industryName || '').toLowerCase();

  // Reject contradictory seniority + title pairings
  if (
    (/\b(fresher|internship|intern|entry level|trainee|graduate)\b/.test(modLower)) &&
    /\b(director|vp|vice president|chief|executive|principal|manager|head of|supervisor)\b/.test(roleLower)
  ) {
    return false;
  }

  // Reject circular token redundancy (e.g., "Data Scientist with Data Science", "Accountant in Accounting")
  if (skillLower && (roleLower.includes(skillLower) || skillLower.includes(roleLower))) {
    return false;
  }
  if (indLower) {
    for (const [a, b] of REDUNDANT_NOISE_PAIRS) {
      if (roleLower.includes(a) && indLower.includes(b) && (input.cityName || input.countryName)) {
        // Fine if clean like "Software Engineer", reject "Sales Executive jobs in Sales"
        if (roleLower === b || indLower.split(' ')[0] === roleLower.split(' ')[0]) {
          return false;
        }
      }
    }
  }

  // Reject city == country redundant labels like "Singapore jobs in Singapore"
  if (
    input.cityName &&
    input.countryName &&
    input.cityName.toLowerCase() === input.countryName.toLowerCase()
  ) {
    return false;
  }

  return true;
}

/**
 * Formats an honest demand provenance note: never fabricates volumes, CPC, or competitor rankings.
 */
export function describeEvidenceStatus(status: EvidenceStatus, detail?: string): string {
  switch (status) {
    case 'GSC_VERIFIED':
      return `Verified in Google Search Console telemetry${detail ? ` (${detail})` : ''}.`;
    case 'GA4_VERIFIED':
      return `Verified in GA4 analytics${detail ? ` (${detail})` : ''}.`;
    case 'PUBLIC_SUGGEST_VERIFIED':
      return `Observed in public Google Autocomplete suggestions; exact monthly volume unknown.`;
    case 'FIRST_PARTY_INVENTORY_BACKED':
      return `Candidate backed by live verified TalentXcel inventory; external search volume unknown.`;
    case 'UNKNOWN':
    default:
      return 'Generated taxonomy candidate; search volume, CPC, and difficulty are UNKNOWN (not fabricated).';
  }
}
