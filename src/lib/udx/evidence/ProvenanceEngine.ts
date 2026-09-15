/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Provenance Engine
 * 
 * Traces every metric, claim, and forecast back to its underlying EvidenceRecord chain.
 */

import { EvidenceStore } from './EvidenceStore';
import { EvidenceRecord, EpistemicValue } from './EvidenceTypes';

export interface ProvenanceAudit {
  claim: string;
  isBackedByEvidence: boolean;
  epistemicStatus: string;
  primaryEvidence?: EvidenceRecord;
  fullEvidenceChain: EvidenceRecord[];
  compositeConfidence: number;
  explanation: string;
}

export class ProvenanceEngine {
  public static auditClaim(epistemic: EpistemicValue): ProvenanceAudit {
    const evidenceIds = epistemic.evidenceIds || [];
    const chain = EvidenceStore.getMany(evidenceIds);

    const isBacked = chain.length > 0;
    const primary = chain[0];

    const confScore = isBacked 
      ? chain.reduce((acc, e) => acc + e.confidence, 0) / chain.length
      : epistemic.confidenceScore;

    return {
      claim: String(epistemic.value),
      isBackedByEvidence: isBacked,
      epistemicStatus: epistemic.status,
      primaryEvidence: primary,
      fullEvidenceChain: chain,
      compositeConfidence: parseFloat(confScore.toFixed(2)),
      explanation: isBacked
        ? `Grounded in ${chain.length} empirical evidence records with ${(confScore * 100).toFixed(0)}% confidence.`
        : 'Modeled or hypothetical claim pending direct empirical sensor measurement.',
    };
  }
}
