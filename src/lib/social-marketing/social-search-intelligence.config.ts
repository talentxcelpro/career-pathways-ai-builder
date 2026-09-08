// src/lib/social-marketing/social-search-intelligence.config.ts
// TalentXcel Social Search Intelligence Configuration
// Enterprise-governed configuration for GSC opportunity scoring, platform weights, analytics benchmarks, and winner thresholds.

export interface SocialSearchIntelligenceConfig {
  // GSC Opportunity Scoring Weights (must sum to 1.0)
  opportunityScoring: {
    demandWeight: number;       // Normalized GSC Impressions proxy
    intentWeight: number;       // Question / How-To / Problem intent
    ctrOpportunityWeight: number; // CTR headroom relative to position/category
    growthWeight: number;       // Period-over-period growth velocity
    shortFormFitWeight: number; // 20-60s visual answering potential
  };

  // Opportunity Tier Thresholds
  opportunityTiers: {
    p0HighMin: number;      // 80 - 100
    p1MediumMin: number;    // 60 - 79
    emergingMin: number;    // 40 - 59
  };

  // Minimum Evidence Filters (prevents 1-impression statistical noise)
  evidenceThresholds: {
    minGscImpressionsToQualify: number;
    minGscClicksForHistoricalCtr: number;
  };

  // Cross-Platform Weighting in Overall Score (must sum to 1.0)
  platformWeights: {
    YOUTUBE: number;
    INSTAGRAM: number;
    FACEBOOK: number;
    X: number;
  };

  // Platform-Specific Performance Metric Weights (each platform sums to 1.0)
  platformMetricWeights: {
    YOUTUBE: {
      viewedVsSwiped: number;
      retentionRate: number;
      rewatchRate: number;
      shareRate: number;
      subscriberRate: number;
    };
    INSTAGRAM: {
      completionRate: number;
      saveRate: number;
      shareRate: number;
      commentRate: number;
      profileVisitRate: number;
    };
    FACEBOOK: {
      watchRetention: number;
      shareRate: number;
      commentRate: number;
      reactionRate: number;
    };
    X: {
      completionRate: number;
      repostQuoteRate: number;
      replyRate: number;
      likeRate: number;
      followProfileRate: number;
    };
  };

  // Performance Benchmarks (rates that represent a 100/100 tier)
  platformBenchmarks: {
    YOUTUBE: {
      viewedVsSwipedTargetPct: number; // e.g. 75%
      retentionTargetPct: number;      // e.g. 85%
      rewatchRateTarget: number;       // e.g. 0.15 (15%)
      shareRateTarget: number;         // e.g. 0.02 (2%)
      subRateTarget: number;           // e.g. 0.01 (1%)
    };
    INSTAGRAM: {
      completionTargetPct: number;     // e.g. 70%
      saveRateTarget: number;          // e.g. 0.05 (5%)
      shareRateTarget: number;         // e.g. 0.04 (4%)
      commentRateTarget: number;       // e.g. 0.02 (2%)
      profileVisitRateTarget: number;  // e.g. 0.015 (1.5%)
    };
    FACEBOOK: {
      retentionTargetPct: number;      // e.g. 65%
      shareRateTarget: number;         // e.g. 0.03 (3%)
      commentRateTarget: number;       // e.g. 0.02 (2%)
      reactionRateTarget: number;      // e.g. 0.05 (5%)
    };
    X: {
      completionTargetPct: number;     // e.g. 60%
      repostQuoteRateTarget: number;   // e.g. 0.025 (2.5%)
      replyRateTarget: number;         // e.g. 0.02 (2%)
      likeRateTarget: number;          // e.g. 0.04 (4%)
      followRateTarget: number;        // e.g. 0.01 (1%)
    };
  };

  // Winner Classification Gates (Anti-Noise Invariant)
  winnerGates: {
    minViewsForWinnerStatus: number;   // Minimum views needed to declare WINNING_TOPIC (vs PROMISING)
    winningTopicScoreMin: number;      // Cross-platform score >= 75
    winningHookScoreMin: number;       // Platform or cross-platform hook score >= 80
  };
}

export const SOCIAL_SEARCH_INTELLIGENCE_CONFIG: SocialSearchIntelligenceConfig = {
  opportunityScoring: {
    demandWeight: 0.30,
    intentWeight: 0.20,
    ctrOpportunityWeight: 0.15,
    growthWeight: 0.15,
    shortFormFitWeight: 0.20,
  },

  opportunityTiers: {
    p0HighMin: 80,
    p1MediumMin: 60,
    emergingMin: 40,
  },

  evidenceThresholds: {
    minGscImpressionsToQualify: 25,     // At least 25 impressions to avoid 1-impression noise
    minGscClicksForHistoricalCtr: 5,
  },

  platformWeights: {
    YOUTUBE: 0.30,
    INSTAGRAM: 0.30,
    FACEBOOK: 0.20,
    X: 0.20,
  },

  platformMetricWeights: {
    YOUTUBE: {
      viewedVsSwiped: 0.30,
      retentionRate: 0.35,
      rewatchRate: 0.15,
      shareRate: 0.10,
      subscriberRate: 0.10,
    },
    INSTAGRAM: {
      completionRate: 0.30,
      saveRate: 0.25,
      shareRate: 0.25,
      commentRate: 0.10,
      profileVisitRate: 0.10,
    },
    FACEBOOK: {
      watchRetention: 0.35,
      shareRate: 0.35,
      commentRate: 0.20,
      reactionRate: 0.10,
    },
    X: {
      completionRate: 0.30,
      repostQuoteRate: 0.30,
      replyRate: 0.20,
      likeRate: 0.10,
      followProfileRate: 0.10,
    },
  },

  platformBenchmarks: {
    YOUTUBE: {
      viewedVsSwipedTargetPct: 75,
      retentionTargetPct: 85,
      rewatchRateTarget: 0.15,
      shareRateTarget: 0.02,
      subRateTarget: 0.01,
    },
    INSTAGRAM: {
      completionTargetPct: 70,
      saveRateTarget: 0.05,
      shareRateTarget: 0.04,
      commentRateTarget: 0.02,
      profileVisitRateTarget: 0.015,
    },
    FACEBOOK: {
      retentionTargetPct: 65,
      shareRateTarget: 0.03,
      commentRateTarget: 0.02,
      reactionRateTarget: 0.05,
    },
    X: {
      completionTargetPct: 60,
      repostQuoteRateTarget: 0.025,
      replyRateTarget: 0.02,
      likeRateTarget: 0.04,
      followRateTarget: 0.01,
    },
  },

  winnerGates: {
    minViewsForWinnerStatus: 500, // Requires at least 500 views to graduate to WINNING_TOPIC
    winningTopicScoreMin: 75,
    winningHookScoreMin: 80,
  },
};
