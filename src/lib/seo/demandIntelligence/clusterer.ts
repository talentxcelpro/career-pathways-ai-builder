// src/lib/seo/demandIntelligence/clusterer.ts
// Incremental streaming cluster aggregator and semantic relationship builder.

import type { ClassifiedKeyword } from './types';

export interface ClusterAggregate {
  clusterKey: string;
  clusterName: string;
  clusterType: string;
  intent: string;
  countryCode: string;
  language: string;
  recommendedHubUrl: string;
  primaryKeyword: string;
  memberCount: number;
  weightedScoreSum: number;
  clusterQuality: number;
  sampleKeywords: string[];
  parentClusterKey: string | null;
}

export class StreamingClusterAggregator {
  private readonly clusters = new Map<string, ClusterAggregate>();

  public add(item: ClassifiedKeyword, scoreHint = 50): void {
    const existing = this.clusters.get(item.clusterKey);
    if (!existing) {
      const parentClusterKey = item.jobRoleSlug
        ? `${item.searchIntent}|role:${item.jobRoleSlug}|glb`
        : item.industrySlug
          ? `job_search|industry:${item.industrySlug}|glb`
          : null;

      this.clusters.set(item.clusterKey, {
        clusterKey: item.clusterKey,
        clusterName: item.clusterName,
        clusterType: item.clusterType,
        intent: item.searchIntent,
        countryCode: item.countryCode,
        language: item.language,
        recommendedHubUrl: item.recommendedDestination,
        primaryKeyword: item.normalizedKeyword,
        memberCount: 1,
        weightedScoreSum: scoreHint,
        clusterQuality: Math.round(item.classificationConfidence * 100),
        sampleKeywords: [item.normalizedKeyword],
        parentClusterKey: parentClusterKey !== item.clusterKey ? parentClusterKey : null,
      });
      return;
    }

    existing.memberCount += 1;
    existing.weightedScoreSum += scoreHint;

    // Prefer shorter, cleaner head keywords as cluster centroid
    if (
      item.normalizedKeyword.length < existing.primaryKeyword.length &&
      item.normalizedKeyword.split(' ').length >= 2
    ) {
      existing.primaryKeyword = item.normalizedKeyword;
    }

    if (existing.sampleKeywords.length < 8 && !existing.sampleKeywords.includes(item.normalizedKeyword)) {
      existing.sampleKeywords.push(item.normalizedKeyword);
    }

    const avgScore = existing.weightedScoreSum / existing.memberCount;
    const sizeFactor = Math.min(100, Math.round(Math.log10(existing.memberCount + 1) * 35));
    existing.clusterQuality = Math.min(100, Math.round(avgScore * 0.65 + sizeFactor * 0.35));
  }

  public getAllClusters(): ClusterAggregate[] {
    return Array.from(this.clusters.values()).sort((a, b) => b.memberCount - a.memberCount);
  }

  public size(): number {
    return this.clusters.size;
  }
}
