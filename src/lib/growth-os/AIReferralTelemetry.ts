/**
 * src/lib/growth-os/AIReferralTelemetry.ts
 *
 * Implements Multi-Channel Discovery & AI Ingestion Telemetry.
 * Explicitly separates traditional search from AI engine citations (Bing Copilot,
 * Perplexity, ChatGPT, Claude) and direct machine agent API queries.
 */

import { DiscoveryChannel, ChannelAcquisitionMetric } from './types';

export class AIReferralTelemetry {
  private static readonly TARGETS: Record<DiscoveryChannel, number> = {
    ORGANIC_SEARCH_GOOGLE: 350000,
    ORGANIC_SEARCH_BING: 100000,
    AI_COPILOT_BING: 20000,
    AI_PERPLEXITY: 15000,
    AI_CHATGPT: 10000,
    AI_CLAUDE: 5000,
    AGENT_API_UDX: 10000,
    INTERACTIVE_TOOLS: 200000,
    DIRECT_BRANDED: 100000,
    SOCIAL_CREATOR: 100000,
    INSTITUTIONAL_PARTNER: 75000,
    DIAGNOSTIC_REFERRAL: 25000,
  };

  /**
   * Evaluates referrers and user agents to classify the inbound discovery channel
   */
  public static classifyInboundRequest(
    referrer: string,
    userAgent: string,
    pathname: string
  ): DiscoveryChannel {
    const ref = (referrer || '').toLowerCase();
    const ua = (userAgent || '').toLowerCase();

    // 1. Direct agent resolution API
    if (pathname.startsWith('/api/udx/') || pathname.startsWith('/api/resolve')) {
      return 'AGENT_API_UDX';
    }

    // 2. AI engine search grounding & citations
    if (ref.includes('perplexity.ai') || ua.includes('perplexitybot')) {
      return 'AI_PERPLEXITY';
    }
    if (ref.includes('copilot.microsoft.com') || ref.includes('bing.com/chat') || ua.includes('copilot')) {
      return 'AI_COPILOT_BING';
    }
    if (ref.includes('chatgpt.com') || ref.includes('openai.com') || ua.includes('chatgpt')) {
      return 'AI_CHATGPT';
    }
    if (ref.includes('claude.ai') || ua.includes('claudebot')) {
      return 'AI_CLAUDE';
    }

    // 3. Conventional Search
    if (ref.includes('google.') || ref.includes('google.com')) {
      return 'ORGANIC_SEARCH_GOOGLE';
    }
    if (ref.includes('bing.com')) {
      return 'ORGANIC_SEARCH_BING';
    }

    // 4. Diagnostic viral referrals
    if (pathname.includes('/verify/diagnostic/') || ref.includes('whatsapp') || ref.includes('telegram')) {
      return 'DIAGNOSTIC_REFERRAL';
    }

    // 5. Social & Creator
    if (ref.includes('linkedin.com') || ref.includes('twitter.com') || ref.includes('x.com') || ref.includes('youtube.com')) {
      return 'SOCIAL_CREATOR';
    }

    // 6. Interactive product magnets
    if (
      pathname.startsWith('/resume/ats-checker') ||
      pathname.startsWith('/tools/salary') ||
      pathname.startsWith('/tools/in-hand-salary') ||
      pathname.startsWith('/career/change-career') ||
      pathname.startsWith('/jobs/match') ||
      pathname.startsWith('/tools/interview')
    ) {
      return 'INTERACTIVE_TOOLS';
    }

    // 7. Default direct
    return 'DIRECT_BRANDED';
  }

  /**
   * Generates channel scorecard initialized with target baselines
   */
  public static getChannelBaselineTargets(): ChannelAcquisitionMetric[] {
    return Object.entries(this.TARGETS).map(([ch, target]) => ({
      channel: ch as DiscoveryChannel,
      monthlyTarget: target,
      actualUniques: 0,
      impressions: 0,
      clicks: 0,
      aiCitations: 0,
      toolCompletions: 0,
      signups: 0,
      verifiedOutcomes: 0,
    }));
  }

  /**
   * Total sum across all acquisition channels (1,010,000 ~ 1M target)
   */
  public static getTotalMonthlyTarget(): number {
    return Object.values(this.TARGETS).reduce((sum, val) => sum + val, 0);
  }
}
