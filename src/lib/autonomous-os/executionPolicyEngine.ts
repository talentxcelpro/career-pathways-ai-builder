// src/lib/autonomous-os/executionPolicyEngine.ts
import { CampaignAction, ChannelType } from './types';

export function evaluateExecutionPolicy(action: {
  channel: ChannelType;
  riskLevel: CampaignAction['riskLevel'];
  isSafeModeActive: boolean;
}): {
  allowedAutonomous: boolean;
  requiresReview: boolean;
  policyReason: string;
} {
  // Safe mode block
  if (action.isSafeModeActive) {
    if (action.channel === 'EXTERNAL_COMMUNITY' || action.riskLevel === 'HIGH') {
      return {
        allowedAutonomous: false,
        requiresReview: true,
        policyReason: 'Safe Mode Active: External community communications and high-risk actions require explicit admin approval.'
      };
    }
  }

  // Internal optimizations (SEO metadata, internal linking, schema, utility calculation) can be autonomous if LOW risk
  if (action.riskLevel === 'LOW' && (action.channel === 'SEARCH_ORGANIC' || action.channel === 'PRODUCT_LED_UTILITY')) {
    return {
      allowedAutonomous: true,
      requiresReview: false,
      policyReason: 'Low-risk internal asset optimization approved for autonomous execution.'
    };
  }

  // Default: External communications, partnerships, and high risk require admin signoff
  return {
    allowedAutonomous: false,
    requiresReview: true,
    policyReason: 'Policy Invariant: External distribution channels require explicit admin review before execution.'
  };
}
