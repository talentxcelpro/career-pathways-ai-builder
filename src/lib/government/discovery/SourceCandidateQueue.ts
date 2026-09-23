/**
 * TalentXcel Global Jobs Network — Source Candidate Queue
 * Staging queue holding discovered prospective government sources
 * in PENDING_REVIEW until verified and certified by administrators.
 */

export interface SourceCandidate {
  id: string;
  portalName: string;
  countryCode: string;
  sourceUrl: string;
  detectedType: 'API' | 'FEED' | 'PORTAL';
  detectedEndpoint?: string;
  verificationScore: number;
  status: 'DISCOVERED' | 'VERIFIED' | 'CERTIFIED' | 'REJECTED';
  discoveredAt: string;
  notes?: string;
}

export class SourceCandidateQueue {
  private static candidates: Map<string, SourceCandidate> = new Map();

  public static addCandidate(candidate: Omit<SourceCandidate, 'id' | 'discoveredAt' | 'status'>): SourceCandidate {
    const id = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const full: SourceCandidate = {
      ...candidate,
      id,
      status: 'DISCOVERED',
      discoveredAt: new Date().toISOString(),
    };
    this.candidates.set(id, full);
    return full;
  }

  public static updateStatus(id: string, status: SourceCandidate['status'], notes?: string): boolean {
    const c = this.candidates.get(id);
    if (!c) return false;
    c.status = status;
    if (notes) c.notes = notes;
    return true;
  }

  public static getCandidates(): SourceCandidate[] {
    return Array.from(this.candidates.values());
  }

  public static getPendingCount(): number {
    return Array.from(this.candidates.values()).filter((c) => c.status === 'DISCOVERED' || c.status === 'VERIFIED').length;
  }

  public static resetAll(): void {
    this.candidates.clear();
  }
}
