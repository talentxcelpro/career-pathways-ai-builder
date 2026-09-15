/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Decision Engine
 * 
 * Classifies proposed resolution actions into governance tiers:
 * - AUTO: Safe autonomous actions (analytics, diagnostic scoring, internal matching)
 * - REVIEW: Actions requiring user or admin authorization (publishing, application send)
 * - FORBIDDEN: Deceptive, spam, or manipulative actions
 */

export type DecisionClass = 'AUTO' | 'REVIEW' | 'FORBIDDEN';

export interface DecisionEvaluation {
  actionName: string;
  decisionClass: DecisionClass;
  reason: string;
  requiresExplicitUserConsent: boolean;
}

export class DecisionEngine {
  private static FORBIDDEN_PATTERNS = [
    'fake_listing',
    'scraping_credentials',
    'unauthorized_spam',
    'deceptive_salary',
    'fabricated_evidence'
  ];

  public static evaluate(actionName: string): DecisionEvaluation {
    const lower = actionName.toLowerCase();

    for (const pat of this.FORBIDDEN_PATTERNS) {
      if (lower.includes(pat)) {
        return {
          actionName,
          decisionClass: 'FORBIDDEN',
          reason: `Violates UDX core truth principle: ${pat} is strictly prohibited.`,
          requiresExplicitUserConsent: false,
        };
      }
    }

    if (lower.includes('submit') || lower.includes('apply') || lower.includes('publish')) {
      return {
        actionName,
        decisionClass: 'REVIEW',
        reason: 'Action executes an external transaction or modifies candidate identity.',
        requiresExplicitUserConsent: true,
      };
    }

    return {
      actionName,
      decisionClass: 'AUTO',
      reason: 'Safe internal path reasoning or diagnostic assessment.',
      requiresExplicitUserConsent: false,
    };
  }
}
