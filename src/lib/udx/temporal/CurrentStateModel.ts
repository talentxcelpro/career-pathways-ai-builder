/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Current State Model (NOW - REALITY SUPPLY GROUNDING)
 * 
 * Represents active reality: verified first-party inventory,
 * live operational readiness, and real-time conditions.
 * 
 * SUPPLY GROUNDING INVARIANT:
 * - Live Supply (456 active job records): Epistemic Status = OBSERVED.
 * - Verified Supply (16 partner listings with rubric-bound comp in Varanasi): Epistemic Status = VERIFIED.
 * - Never conflate live supply with verified partner supply.
 */

export type SupplyEpistemicStatus = 'OBSERVED' | 'VERIFIED' | 'STALE' | 'EXPIRED' | 'UNAVAILABLE';

export interface LiveTruthInventoryItem {
  id: string;
  domain: string;
  title: string;
  location: string;
  verificationStatus: SupplyEpistemicStatus;
  isFirstParty: boolean;
  compensationOrValue?: string;
  activeSince: string;
}

export interface SupplyMetrics {
  totalLiveSupplyCount: number; // 456 active job records in Supabase
  liveSupplyEpistemicStatus: SupplyEpistemicStatus; // OBSERVED
  verifiedPartnerSupplyCount: number; // 16 verified partner roles with rubric compensation
  verifiedSupplyEpistemicStatus: SupplyEpistemicStatus; // VERIFIED
  lastAuditTimestamp: string;
}

export class CurrentStateModel {
  private inventory: LiveTruthInventoryItem[] = [];
  private static liveSupplyCount = 456;
  private static verifiedSupplyCount = 16;

  constructor() {
    this.seedVerifiedInventory();
  }

  private seedVerifiedInventory() {
    this.inventory = [
      {
        id: 'b8509535-17b2-47ae-92b3-c9c1c534a74d',
        domain: 'CAREER',
        title: 'Senior Frontend Engineer - React & TypeScript',
        location: 'Varanasi, Uttar Pradesh, India',
        verificationStatus: 'VERIFIED',
        isFirstParty: true,
        compensationOrValue: '₹16,00,000 - ₹29,20,000 / yr',
        activeSince: '2026-09-08'
      },
      {
        id: '24d8ef0d-c678-4b7f-b667-20ef597032d1',
        domain: 'CAREER',
        title: 'Junior / Associate Frontend Engineer - React & TypeScript',
        location: 'Varanasi, Uttar Pradesh, India',
        verificationStatus: 'VERIFIED',
        isFirstParty: true,
        compensationOrValue: '₹4,20,000 - ₹6,50,000 / yr',
        activeSince: '2026-09-09'
      },
      {
        id: '7fe81519-89e9-4145-9403-f2ec7030b63f',
        domain: 'CAREER',
        title: 'Frontend Engineer - React & TypeScript',
        location: 'Varanasi, Uttar Pradesh, India',
        verificationStatus: 'VERIFIED',
        isFirstParty: true,
        compensationOrValue: '₹7,50,000 - ₹13,80,000 / yr',
        activeSince: '2026-09-09'
      },
      {
        id: 'cbfcdddf-bc9c-41a2-b137-6ed22102b2b0',
        domain: 'CAREER',
        title: 'Senior AI Research & Computer Vision Engineer',
        location: 'Varanasi, Uttar Pradesh, India',
        verificationStatus: 'VERIFIED',
        isFirstParty: true,
        compensationOrValue: '₹16,00,000 - ₹29,60,000 / yr',
        activeSince: '2026-09-05'
      },
      {
        id: '62a915e5-d704-4468-b64e-df95975f8cc3',
        domain: 'CAREER',
        title: 'Junior / Associate Credit Risk Underwriting Manager',
        location: 'Varanasi, Uttar Pradesh, India',
        verificationStatus: 'VERIFIED',
        isFirstParty: true,
        compensationOrValue: '₹4,20,000 - ₹6,20,000 / yr',
        activeSince: '2026-09-06'
      }
    ];
  }

  public static getSupplyMetrics(): SupplyMetrics {
    return {
      totalLiveSupplyCount: this.liveSupplyCount,
      liveSupplyEpistemicStatus: 'OBSERVED',
      verifiedPartnerSupplyCount: this.verifiedSupplyCount,
      verifiedSupplyEpistemicStatus: 'VERIFIED',
      lastAuditTimestamp: new Date().toISOString(),
    };
  }

  public static setLiveSupplyCount(count: number): void {
    this.liveSupplyCount = count;
  }

  public static setVerifiedSupplyCount(count: number): void {
    this.verifiedSupplyCount = count;
  }

  public getVerifiedInventory(domain?: string, locationFilter?: string): LiveTruthInventoryItem[] {
    return this.inventory.filter(item => {
      const matchDomain = !domain || item.domain === domain;
      const matchLoc = !locationFilter || 
        item.location.toLowerCase().includes(locationFilter.toLowerCase()) || 
        item.location.toLowerCase().includes('remote');
      return matchDomain && matchLoc && item.verificationStatus === 'VERIFIED';
    });
  }

  public getAllInventory(): LiveTruthInventoryItem[] {
    return [...this.inventory];
  }
}
