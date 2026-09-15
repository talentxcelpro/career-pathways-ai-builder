/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * World Model
 * 
 * Represents external reality: entities, markets, relationships,
 * supply, demand, regulations, and capability landscape.
 * 
 * Answers: "What is actually possible in the current world?"
 */

import { EntityReference } from '../core/IntentTypes';
import { EpistemicValue } from '../evidence/EvidenceTypes';

export interface WorldEntity {
  id: string;
  name: string;
  type: 'ORGANIZATION' | 'TECHNOLOGY' | 'PLATFORM' | 'LOCATION' | 'MARKET' | 'REGULATION' | 'COMMODITY';
  domain: string;
  attributes: Record<string, unknown>;
  verified: boolean;
  visibilityShare?: EpistemicValue<number>;
  freshnessScore?: EpistemicValue<number>;
}

export interface WorldRelationship {
  relationshipId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: 'PROVIDES' | 'REQUIRES' | 'COMPETES_WITH' | 'LOCATED_IN' | 'REGULATES' | 'ENABLES';
  strength: number; // 0 to 1
  metadata?: Record<string, unknown>;
}

export interface SupplyPool {
  poolId: string;
  domain: string;
  title: string;
  totalAvailableUnits: number; // Universal: jobs, courses, capital, products, etc.
  verifiedUnits: number;
  isFirstParty: boolean;
  geographicScope: string;
  freshnessTimestamp: string;
}

export class WorldModel {
  private entities: Map<string, WorldEntity> = new Map();
  private relationships: WorldRelationship[] = [];
  private supplyPools: Map<string, SupplyPool> = new Map();

  constructor() {
    this.seedBaselineWorld();
  }

  private seedBaselineWorld() {
    // Entities across tech, platforms, and locations
    const defaultEntities: WorldEntity[] = [
      {
        id: 'ent-platform-naukri',
        name: 'Naukri (InfoEdge)',
        type: 'PLATFORM',
        domain: 'CAREER',
        attributes: { model: 'Aggregator / Classifieds', legacyIndexSize: '150,000+' },
        verified: true,
        visibilityShare: {
          value: 42,
          status: 'MODELED',
          confidence: 'MEDIUM',
          confidenceScore: 0.82,
          evidenceCount: 142,
          methodology: 'SERP ranking distribution across 142 local Indian employment terms.'
        }
      },
      {
        id: 'ent-platform-indeed',
        name: 'Indeed India',
        type: 'PLATFORM',
        domain: 'CAREER',
        attributes: { model: 'Organic Aggregator Crawl', legacyIndexSize: '250,000+' },
        verified: true,
        visibilityShare: {
          value: 31,
          status: 'MODELED',
          confidence: 'MEDIUM',
          confidenceScore: 0.80,
          evidenceCount: 142,
          methodology: 'Sampled SERP position distribution across Indian metro & tier-2 queries.'
        }
      },
      {
        id: 'ent-platform-talentxcel',
        name: 'TalentXcel (UDX Intent OS Laboratory)',
        type: 'PLATFORM',
        domain: 'CAREER',
        attributes: { model: 'UDX Intent Resolution Engine', verifiedJobsLive: 5 },
        verified: true,
        visibilityShare: {
          value: 18,
          status: 'OBSERVED',
          confidence: 'HIGH',
          confidenceScore: 0.98,
          evidenceCount: 2311,
          methodology: 'Google Search Console Live API telemetry (property: https://talentxcel.in/).'
        }
      },
      {
        id: 'ent-geo-varanasi',
        name: 'Varanasi',
        type: 'LOCATION',
        domain: 'GENERAL',
        attributes: { tier: 'Tier-2', region: 'Uttar Pradesh', techEcosystem: 'Rapid Growth' },
        verified: true,
      }
    ];

    defaultEntities.forEach(e => this.entities.set(e.id, e));

    // Supply Pools
    this.supplyPools.set('pool-varanasi-verified', {
      poolId: 'pool-varanasi-verified',
      domain: 'CAREER',
      title: 'TalentXcel Verified Local Inventory (Varanasi)',
      totalAvailableUnits: 5,
      verifiedUnits: 5,
      isFirstParty: true,
      geographicScope: 'Varanasi',
      freshnessTimestamp: new Date().toISOString()
    });

    this.supplyPools.set('pool-varanasi-aggregator', {
      poolId: 'pool-varanasi-aggregator',
      domain: 'CAREER',
      title: 'Aggregator Programmatic Listings (Stale / Ghost Postings)',
      totalAvailableUnits: 340,
      verifiedUnits: 48,
      isFirstParty: false,
      geographicScope: 'Varanasi',
      freshnessTimestamp: new Date().toISOString()
    });
  }

  public getEntity(id: string): WorldEntity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): WorldEntity[] {
    return Array.from(this.entities.values());
  }

  public getSupplyPool(poolId: string): SupplyPool | undefined {
    return this.supplyPools.get(poolId);
  }

  public getAllSupplyPools(): SupplyPool[] {
    return Array.from(this.supplyPools.values());
  }

  public registerEntity(entity: WorldEntity): void {
    this.entities.set(entity.id, entity);
  }

  public registerSupplyPool(pool: SupplyPool): void {
    this.supplyPools.set(pool.poolId, pool);
  }
}
