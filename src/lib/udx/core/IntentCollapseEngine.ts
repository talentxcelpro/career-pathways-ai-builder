/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Dynamic Intent Collapse Engine
 * 
 * ARCHITECTURAL RULE 1:
 * Never hardcode N canonical intents (e.g. 16).
 * The number of canonical intents N is dynamically computed from actual signals
 * via token jaccard similarity, entity affinity, and goal distillation.
 */

import { UDXIntent, IntentCluster, EntityReference, UDXDomain } from './IntentTypes';

export interface DynamicCollapseResult {
  totalInputSignals: number;
  discoveredCanonicalCount: number; // Dynamic N
  clusters: IntentCluster[];
  unclusteredCount: number;
  averageClusterCohesion: number;
}

export class IntentCollapseEngine {
  /**
   * Dynamically collapses M raw intents or signals into N canonical intent clusters.
   * N is NOT predetermined; it emerges from semantic density and entity clustering.
   */
  public static collapse(
    intents: UDXIntent[],
    similarityThreshold: number = 0.35
  ): DynamicCollapseResult {
    if (!intents || intents.length === 0) {
      return {
        totalInputSignals: 0,
        discoveredCanonicalCount: 0,
        clusters: [],
        unclusteredCount: 0,
        averageClusterCohesion: 1.0,
      };
    }

    const clusters: IntentCluster[] = [];
    const assignedIntentIds = new Set<string>();

    // Normalize helper
    const tokenize = (text: string): Set<string> => {
      const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'in', 'to', 'for', 'of', 'and', 'or', 'with', 'by'
      ]);
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
      return new Set(words);
    };

    const computeSimilarity = (a: UDXIntent, b: UDXIntent): number => {
      // 1. Same domain prerequisite
      if (a.domain !== b.domain) return 0;

      // 2. Goal & Canonical Token Overlap (Jaccard)
      const tokensA = tokenize(`${a.canonicalIntent} ${a.goal}`);
      const tokensB = tokenize(`${b.canonicalIntent} ${b.goal}`);
      
      let intersectionCount = 0;
      tokensA.forEach(t => {
        if (tokensB.has(t)) intersectionCount++;
      });
      
      const unionSize = new Set([...tokensA, ...tokensB]).size;
      const tokenSim = unionSize > 0 ? intersectionCount / unionSize : 0;

      // 3. Entity overlap
      const entitiesA = new Set(a.entities.map(e => e.name.toLowerCase()));
      const entitiesB = new Set(b.entities.map(e => e.name.toLowerCase()));
      let entityOverlap = 0;
      entitiesA.forEach(e => {
        if (entitiesB.has(e)) entityOverlap++;
      });
      const entityUnion = new Set([...entitiesA, ...entitiesB]).size;
      const entitySim = entityUnion > 0 ? entityOverlap / entityUnion : 0;

      // Weighted composite similarity
      return tokenSim * 0.7 + entitySim * 0.3;
    };

    // Sort by signal volume / confidence descending to find anchor intents
    const sorted = [...intents].sort((a, b) => {
      const volA = (a.sourceSignals?.length || 1) * a.confidence;
      const volB = (b.sourceSignals?.length || 1) * b.confidence;
      return volB - volA;
    });

    for (const anchor of sorted) {
      if (assignedIntentIds.has(anchor.intentId)) continue;

      const clusterIntents: UDXIntent[] = [anchor];
      assignedIntentIds.add(anchor.intentId);

      let totalSim = 1.0;

      for (const candidate of sorted) {
        if (assignedIntentIds.has(candidate.intentId)) continue;

        const sim = computeSimilarity(anchor, candidate);
        if (sim >= similarityThreshold) {
          clusterIntents.push(candidate);
          assignedIntentIds.add(candidate.intentId);
          totalSim += sim;
        }
      }

      // Consolidate dominant entities
      const entityMap = new Map<string, { count: number; ref: EntityReference }>();
      clusterIntents.forEach(ci => {
        ci.entities.forEach(ent => {
          const key = ent.name.toLowerCase();
          const existing = entityMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            entityMap.set(key, { count: 1, ref: ent });
          }
        });
      });

      const dominantEntities = Array.from(entityMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(v => v.ref);

      const totalSignalVolume = clusterIntents.reduce(
        (sum, ci) => sum + (ci.sourceSignals?.length || 1),
        0
      );

      const cohesion = totalSim / clusterIntents.length;

      clusters.push({
        clusterId: `cluster-${anchor.domain.toLowerCase()}-${clusters.length + 1}-${anchor.intentId.slice(0, 8)}`,
        canonicalIntent: anchor.canonicalIntent,
        domain: anchor.domain,
        intentCount: clusterIntents.length,
        signalVolume: totalSignalVolume,
        intents: clusterIntents,
        dominantEntities,
        cohesionScore: parseFloat(cohesion.toFixed(3)),
      });
    }

    const totalCohesion = clusters.reduce((sum, c) => sum + c.cohesionScore, 0);
    const avgCohesion = clusters.length > 0 ? totalCohesion / clusters.length : 1.0;

    return {
      totalInputSignals: intents.length,
      discoveredCanonicalCount: clusters.length, // Dynamic N!
      clusters,
      unclusteredCount: intents.length - assignedIntentIds.size,
      averageClusterCohesion: parseFloat(avgCohesion.toFixed(3)),
    };
  }
}
