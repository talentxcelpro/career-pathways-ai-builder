import { DualViralMetrics } from './types';

export interface ShareableResultCard {
  resultId: string;
  toolType: 'ats' | 'salary' | 'career-path' | 'interview' | 'passport';
  shareUrl: string;
  embedSnippet: string;
  title: string;
  summaryText: string;
  createdAt: string;
  shareCount: number;
  clickCount: number;
  convertedSignupCount: number;
}

/**
 * Referral Engine
 * =========================================================================
 * Manages viral and peer referral loops across public diagnostic results.
 * Distinguishes:
 *  - share_generated (user copies or shares link)
 *  - referral_click (recipient loads the public result)
 *  - referred_new_visitor (recipient is a unique visitor)
 *  - referred_signup (recipient registers)
 * 
 * Computes dual viral coefficients:
 *  - K_visit = referred_new_visitors / eligible_users
 *  - K_signup = referred_signups / eligible_users
 */
export class ReferralEngine {
  private static readonly BASE_URL = 'https://talentxcel.in';

  /**
   * Generates a canonical public shareable URL for a tool diagnostic result.
   */
  public static generateShareCard(
    toolType: 'ats' | 'salary' | 'career-path' | 'interview' | 'passport',
    referrerVisitorId: string,
    metadata: {
      title: string;
      summaryText: string;
    }
  ): ShareableResultCard {
    const resultToken = this.generateToken(12);
    const prefix = toolType === 'passport' ? '/p/@' : `/t/${toolType}/`;
    const shareUrl = `${this.BASE_URL}${prefix}${resultToken}?ref=${encodeURIComponent(referrerVisitorId)}`;
    const embedSnippet = `<iframe src="${this.BASE_URL}/embed/${toolType}?token=${resultToken}" width="100%" height="480" frameborder="0" loading="lazy"></iframe>`;

    return {
      resultId: resultToken,
      toolType,
      shareUrl,
      embedSnippet,
      title: metadata.title,
      summaryText: metadata.summaryText,
      createdAt: new Date().toISOString(),
      shareCount: 1,
      clickCount: 0,
      convertedSignupCount: 0
    };
  }

  /**
   * Calculates empirical dual viral metrics.
   * Compounding is ONLY declared if kSignup > 1.0.
   */
  public static calculateViralMetrics(events: {
    eligibleUsers: number;
    sharesGenerated: number;
    referralClicks: number;
    referredNewVisitors: number;
    referredSignups: number;
    referredActivations: number;
  }): DualViralMetrics {
    const eligible = Math.max(1, events.eligibleUsers);
    const kVisit = Number((events.referredNewVisitors / eligible).toFixed(3));
    const kSignup = Number((events.referredSignups / eligible).toFixed(3));

    return {
      sharesGenerated: events.sharesGenerated,
      referralClicks: events.referralClicks,
      referredNewVisitors: events.referredNewVisitors,
      referredSignups: events.referredSignups,
      referredActivations: events.referredActivations,
      eligibleUsers: events.eligibleUsers,
      kVisit,
      kSignup,
      isViralCompounding: kSignup > 1.0 // Empirical definition: requires each user to yield >1 active new signup
    };
  }

  private static generateToken(length: number = 10): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
