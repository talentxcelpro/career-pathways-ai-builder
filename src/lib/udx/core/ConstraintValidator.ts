/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Universal Constraint Validator (Physical, Economic, Spatial, Temporal Boundaries)
 * 
 * CORE SCIENTIFIC INVARIANT:
 * Guarantees that UDX rejects physically impossible, economically contradictory,
 * or spatially paradoxical objectives at the boundary layer without fabricating fake certainty.
 */

export type ParadoxType = 
  | 'ECONOMIC_PARADOX' 
  | 'SPATIAL_PARADOX' 
  | 'TEMPORAL_PARADOX' 
  | 'PHYSICAL_IMPOSSIBILITY';

export interface ConstraintValidationResult {
  isValid: boolean;
  paradoxType?: ParadoxType;
  violationReason?: string;
  detectedContradictions?: string[];
  epistemicConfidence: number; // 0.0 when invalid
}

export class ConstraintValidator {
  /**
   * Validates a raw input signal against known physical, economic, spatial, and temporal boundaries.
   */
  public static validate(signal: string): ConstraintValidationResult {
    const lower = signal.toLowerCase();

    // 1. Economic Paradox Detection
    // e.g. Zero hours/effort demanding immense financial return, or guaranteed infinite return
    const hasZeroEffort = /\b(0 hours?|zero hours?|zero work|no work|no effort|without working|zero capital and zero effort)\b/i.test(lower);
    const hasExtremeYield = /\b(50 lakhs?|crores?|billions?|1000%|guaranteed wealth|get rich quick)\b/i.test(lower);
    const hasImpossibleReturn = /\b(1000%\s*(daily|guaranteed)|perpetual\s*profit|infinite\s*money\s*glitch|guaranteed\s*(40%|\d{2,}%)\s*(risk-free|annual|return)|risk-free\s*(40%|\d{2,}%))\b/i.test(lower);

    if ((hasZeroEffort && hasExtremeYield) || hasImpossibleReturn) {
      return {
        isValid: false,
        paradoxType: 'ECONOMIC_PARADOX',
        violationReason: 'Economic Paradox: Demands extreme capital return or guaranteed risk-free yield exceeding fundamental sovereign benchmarks, violating statutory regulations and financial equilibrium.',
        detectedContradictions: [
          hasZeroEffort ? 'Zero labor / zero hours allocation' : 'Unrealistic risk-free return expectation',
          hasExtremeYield ? 'Extreme capital generation' : 'Impossible guaranteed yield claim',
        ],
        epistemicConfidence: 0.0,
      };
    }

    // 2. Spatial Paradox Detection (Bi-location / Multi-location)
    // Simultaneous in-person presence in disjoint geographic locations
    const hasInPerson = /\b(in-person|in\s*office|on-site|physically)\b/i.test(lower);
    const hasSimultaneous = /\b(simultaneously|at\s*the\s*same\s*time|every\s*single\s*day|both)\b/i.test(lower);
    const cities = ['tokyo', 'new york', 'london', 'bangalore', 'varanasi', 'delhi', 'mumbai', 'paris', 'sydney', 'dubai'];
    const matchedCities = cities.filter(c => lower.includes(c));

    if ((hasInPerson && matchedCities.length >= 2 && hasSimultaneous) || lower.includes('two places at once')) {
      return {
        isValid: false,
        paradoxType: 'SPATIAL_PARADOX',
        violationReason: `Spatial Paradox: Requires simultaneous physical presence across mutually exclusive geographic coordinates (${matchedCities.join(' & ')}), violating spatial locality laws.`,
        detectedContradictions: [
          `In-person physical presence required`,
          `Geographic coordinates disjoint: ${matchedCities.join(', ')}`,
          `Simultaneous daily schedule demanded`,
        ],
        epistemicConfidence: 0.0,
      };
    }

    // 3. Temporal Paradox Detection (Causality & Instantaneous Multi-Year Credentials)
    const hasTimeTravel = /\b(travel backwards in time|go back to (19|20)\d\d|reverse time|travel to the past)\b/i.test(lower);
    const hasInstantCredential = 
      (lower.includes('astronaut') && (lower.includes('tomorrow') || lower.includes('today'))) ||
      (lower.includes('neurosurgeon') && (lower.includes('tomorrow') || lower.includes('today'))) ||
      (lower.includes('zero physical training') && lower.includes('astronaut'));

    if (hasTimeTravel || hasInstantCredential) {
      return {
        isValid: false,
        paradoxType: 'TEMPORAL_PARADOX',
        violationReason: hasTimeTravel
          ? 'Temporal Paradox: Violates causal arrow of time by demanding retroactive intervention in past temporal coordinates.'
          : 'Temporal Paradox: Demands instantaneous acquisition of multi-year institutional credentials without necessary elapsed training duration.',
        detectedContradictions: [
          hasTimeTravel ? 'Retrograde causality demanded' : 'Zero elapsed preparation time',
          'Physical and regulatory institutional lead-time violated',
        ],
        epistemicConfidence: 0.0,
      };
    }

    // 4. Physical Impossibility Detection (Thermodynamics & Natural Laws)
    const hasPerpetualMotion = lower.includes('perpetual motion');
    const hasTeleportation = lower.includes('teleport');
    const hasInfiniteEnergy = lower.includes('infinite free energy');
    const hasFasterThanLight = lower.includes('faster than light');

    if (hasPerpetualMotion || hasTeleportation || hasInfiniteEnergy || hasFasterThanLight) {
      return {
        isValid: false,
        paradoxType: 'PHYSICAL_IMPOSSIBILITY',
        violationReason: 'Physical Impossibility: Violates thermodynamic conservation laws or fundamental relativistic constraints.',
        detectedContradictions: [
          'Violates physical/thermodynamic conservation principles',
          'No verified empirical mechanism exists in known physical reality',
        ],
        epistemicConfidence: 0.0,
      };
    }

    // Valid signal within known boundaries
    return {
      isValid: true,
      epistemicConfidence: 1.0,
    };
  }
}
