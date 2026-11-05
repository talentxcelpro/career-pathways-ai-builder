// Centrally managed, versioned monthly creator targets for TalentXcel Network
// Conforms to TXC-NETWORK-CREATOR-STUDIO-009

export interface MonthlyMetricTarget {
  id: string;
  name: string;
  category: 'reach' | 'engagement' | 'knowledge' | 'community' | 'growth';
  description: string;
  calculationMethod: string;
  authoritativeTable: string;
  targets: {
    free: number;
    starter: number;    // Career Starter ₹199/mo (mapped to 'basic')
    pro: number;        // Career Pro ₹499/mo (mapped to 'pro')
    premium: number;    // Career Premium ₹999/mo (mapped to 'enterprise')
  };
}

export interface CreatorTargetsConfig {
  version: string;
  effectiveFrom: string;
  netRevenuePoolPercentage: number; // 30% of net platform subscription revenue
  metrics: Record<string, MonthlyMetricTarget>;
}

export const CURRENT_CREATOR_TARGETS_CONFIG: CreatorTargetsConfig = {
  version: "v2026.11.1",
  effectiveFrom: "2026-11-01T00:00:00Z",
  netRevenuePoolPercentage: 30,
  metrics: {
    human_reach: {
      id: "human_reach",
      name: "Qualified Human Reach",
      category: "reach",
      description: "Distinct authenticated accounts viewing creator profiles or long-form publications, excluding self-views and automated traffic.",
      calculationMethod: "COUNT(DISTINCT viewer_id) FROM profile_views WHERE profile_id = :userId AND viewer_id != :userId",
      authoritativeTable: "public.profile_views",
      targets: {
        free: 50,
        starter: 100,
        pro: 500,
        premium: 1500,
      }
    },
    engagements: {
      id: "engagements",
      name: "Meaningful Engagements",
      category: "engagement",
      description: "Validated reactions, substantive comments, and shares on original published posts, deduplicated and excluding self-engagement.",
      calculationMethod: "SUM(likes_count + comments_count + shares_count) FROM posts WHERE author_id = :userId",
      authoritativeTable: "public.posts, public.post_reactions, public.post_comments",
      targets: {
        free: 5,
        starter: 10,
        pro: 50,
        premium: 150,
      }
    },
    articles: {
      id: "articles",
      name: "Technical Articles",
      category: "knowledge",
      description: "Original technical articles, architectural post-mortems, and engineering breakdowns published during the monthly reporting window.",
      calculationMethod: "COUNT(*) FROM posts WHERE author_id = :userId AND post_type IN ('article', 'career_article') AND status = 'published'",
      authoritativeTable: "public.posts",
      targets: {
        free: 1,
        starter: 1,
        pro: 2,
        premium: 4,
      }
    },
    helpful_answers: {
      id: "helpful_answers",
      name: "Helpful Answers",
      category: "community",
      description: "Verified answers in technical Q&A threads and community problem drives validated with helpful peer feedback.",
      calculationMethod: "Authoritative Q&A feed telemetry (requires active Q&A forum table; marked Unavailable when table does not exist)",
      authoritativeTable: "Not yet provisioned in schema",
      targets: {
        free: 1,
        starter: 3,
        pro: 10,
        premium: 25,
      }
    },
    mentorship: {
      id: "mentorship",
      name: "Mentorship Contributions",
      category: "community",
      description: "Completed and verified 1-on-1 mentorship or advisory sessions booked and completed through the platform.",
      calculationMethod: "COUNT(*) FROM mentorship_sessions WHERE mentor_id = :userId AND status = 'completed'",
      authoritativeTable: "public.mentorship_sessions",
      targets: {
        free: 0,
        starter: 1,
        pro: 2,
        premium: 4,
      }
    },
    quality_posts: {
      id: "quality_posts",
      name: "Quality Posts",
      category: "knowledge",
      description: "Published standard network posts that meet length, integrity, and active discussion criteria.",
      calculationMethod: "COUNT(*) FROM posts WHERE author_id = :userId AND post_type NOT IN ('article', 'career_article') AND status = 'published' AND is_deleted = false",
      authoritativeTable: "public.posts",
      targets: {
        free: 2,
        starter: 4,
        pro: 8,
        premium: 12,
      }
    },
    audience_growth: {
      id: "audience_growth",
      name: "Genuine Audience Growth",
      category: "growth",
      description: "Net newly established accepted connections and profile followers during the current calendar month.",
      calculationMethod: "COUNT(*) FROM connections WHERE (requester_id = :userId OR recipient_id = :userId) AND status = 'accepted' AND connected_at >= :periodStart",
      authoritativeTable: "public.connections",
      targets: {
        free: 2,
        starter: 5,
        pro: 20,
        premium: 50,
      }
    }
  }
};

/**
 * Resolve target for a given metric and user subscription tier
 */
export function getMetricTarget(metricId: string, tier: 'free' | 'basic' | 'pro' | 'enterprise'): number {
  const metric = CURRENT_CREATOR_TARGETS_CONFIG.metrics[metricId];
  if (!metric) return 0;
  
  switch (tier) {
    case 'basic': // Starter ₹199
      return metric.targets.starter;
    case 'pro': // Pro ₹499
      return metric.targets.pro;
    case 'enterprise': // Premium ₹999
      return metric.targets.premium;
    case 'free':
    default:
      return metric.targets.free;
  }
}
