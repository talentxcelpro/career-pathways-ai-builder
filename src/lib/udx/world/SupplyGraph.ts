/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Supply Graph
 * 
 * Maps live supply availability, verification state, and inventory health
 * across domains and geographic/capability clusters.
 */

import { SupplyPool } from './WorldModel';

export interface SupplyGapResult {
  scope: string;
  domain: string;
  hasVerifiedSupply: boolean;
  verifiedCount: number;
  unverifiedCount: number;
  vacuumSeverity: 'NONE' | 'MODERATE' | 'CRITICAL';
  alternativePathsRecommended: boolean;
}

export class SupplyGraph {
  private pools: Map<string, SupplyPool> = new Map();

  public registerPool(pool: SupplyPool): void {
    this.pools.set(pool.poolId, pool);
  }

  public evaluateSupplyGap(scope: string, domain: string): SupplyGapResult {
    const relevant = Array.from(this.pools.values()).filter(p => 
      p.domain === domain && p.geographicScope.toLowerCase().includes(scope.toLowerCase())
    );

    const verified = relevant.filter(p => p.isFirstParty).reduce((acc, p) => acc + p.verifiedUnits, 0);
    const unverified = relevant.filter(p => !p.isFirstParty).reduce((acc, p) => acc + p.totalAvailableUnits, 0);

    let vacuumSeverity: SupplyGapResult['vacuumSeverity'] = 'NONE';
    if (verified === 0 && unverified === 0) {
      vacuumSeverity = 'CRITICAL';
    } else if (verified === 0 && unverified > 0) {
      vacuumSeverity = 'CRITICAL'; // Classic aggregator phantom inventory risk
    } else if (verified < 3) {
      vacuumSeverity = 'MODERATE';
    }

    return {
      scope,
      domain,
      hasVerifiedSupply: verified > 0,
      verifiedCount: verified,
      unverifiedCount: unverified,
      vacuumSeverity,
      alternativePathsRecommended: verified === 0,
    };
  }

  public getAllPools(): SupplyPool[] {
    return Array.from(this.pools.values());
  }
}
