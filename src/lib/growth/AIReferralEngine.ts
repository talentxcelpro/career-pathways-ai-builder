import { AIInteractionClassification, AIReferralConfidence, AICrawlerStatus, assertCrawlerNotVisitor } from './types';

/**
 * AI Referral & Crawler Telemetry Engine
 * =========================================================================
 * Enforces strict attribution separation:
 * 1. AI Crawlers (GPTBot, ClaudeBot, PerplexityBot) are classified as AI_CRAWLER_OBSERVED.
 *    They enter crawler telemetry, NEVER human visitors or signups.
 * 2. AI Referrals require verified human browser navigation originating from an AI interface.
 * 3. Confidence tiers: CONFIRMED (verified referrer / UTM), LIKELY (multiple signals),
 *    UNKNOWN (direct/unattributed — never guessed).
 */
export class AIReferralEngine {
  private static readonly KNOWN_AI_REFERRERS: Record<string, 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini' | 'Copilot' | 'GoogleAI'> = {
    'chatgpt.com': 'ChatGPT',
    'chat.openai.com': 'ChatGPT',
    'claude.ai': 'Claude',
    'perplexity.ai': 'Perplexity',
    'gemini.google.com': 'Gemini',
    'copilot.microsoft.com': 'Copilot',
    'bing.com/chat': 'Copilot'
  };

  private static readonly KNOWN_AI_CRAWLERS: string[] = [
    'gptbot',
    'chatgpt-user',
    'claudebot',
    'claude-web',
    'perplexitybot',
    'google-extended',
    'bytespider',
    'ccbot',
    'anthropic-ai',
    'cohere-ai'
  ];

  /**
   * Classifies an incoming request into human referral, automated crawler, or standard web traffic.
   */
  public static classifyRequest(headers: {
    referrer?: string | null;
    userAgent?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
  }): AIInteractionClassification {
    const ua = (headers.userAgent || '').toLowerCase();
    const ref = (headers.referrer || '').toLowerCase();
    const utmSrc = (headers.utmSource || '').toLowerCase();

    // Check 1: Automated Crawler Detection
    const matchedCrawler = this.KNOWN_AI_CRAWLERS.find(bot => ua.includes(bot));
    if (matchedCrawler) {
      return {
        trafficClass: 'AUTOMATED_CRAWLER',
        referralConfidence: 'AI_REFERRAL_UNKNOWN',
        crawlerStatus: 'AI_CRAWLER_OBSERVED',
        detectedAgent: matchedCrawler
      };
    }

    // Check 2: Explicit UTM parameters
    if (utmSrc.includes('chatgpt') || utmSrc.includes('perplexity') || utmSrc.includes('claude') || utmSrc === 'ai') {
      const platform = utmSrc.includes('chatgpt') ? 'ChatGPT'
        : utmSrc.includes('perplexity') ? 'Perplexity'
        : utmSrc.includes('claude') ? 'Claude'
        : 'Other';
      return {
        trafficClass: 'HUMAN_REFERRAL',
        referralConfidence: 'AI_REFERRAL_CONFIRMED',
        originatingPlatform: platform
      };
    }

    // Check 3: Verified HTTP Referrer
    for (const [domain, platform] of Object.entries(this.KNOWN_AI_REFERRERS)) {
      if (ref.includes(domain)) {
        return {
          trafficClass: 'HUMAN_REFERRAL',
          referralConfidence: 'AI_REFERRAL_CONFIRMED',
          originatingPlatform: platform
        };
      }
    }

    // Check 4: Likely AI Referral (multiple independent signals required)
    const isGoogleAiExperience = ref.includes('google.com') && (ref.includes('sxs') || ref.includes('ai_overview'));
    if (isGoogleAiExperience) {
      return {
        trafficClass: 'HUMAN_REFERRAL',
        referralConfidence: 'AI_REFERRAL_LIKELY',
        originatingPlatform: 'GoogleAI'
      };
    }

    // Default: Unattributed or Standard Web — NEVER guess direct traffic as AI
    return {
      trafficClass: 'STANDARD_WEB',
      referralConfidence: 'AI_REFERRAL_UNKNOWN',
      originatingPlatform: null
    };
  }

  /**
   * Enforces that crawler hits yield 0 unique visitor increment.
   */
  public static filterVisitorIncrement(classification: AIInteractionClassification, proposedCount: number): number {
    const isCrawler = classification.trafficClass === 'AUTOMATED_CRAWLER';
    return assertCrawlerNotVisitor(isCrawler, proposedCount);
  }
}
