// ============================================================================
// TXC MINING POLICY - PERMANENT CONFIGURATION
// 
// ⚠️  CRITICAL WARNING: This policy is PERMANENT and IMMUTABLE ⚠️
// 
// This configuration must NOT be modified without explicit authorization.
// All TXC reward systems across the platform MUST use these exact values.
// Any changes to this policy require formal approval process.
//
// Policy Source: https://talentxcel.in/txc/mining
// Last Updated: 2025-09-24
// Status: PERMANENT - DO NOT MODIFY
// ============================================================================

export interface TXCReward {
  action: string;
  amount: number;
  description: string;
  cooldownMinutes?: number;
  category: 'daily' | 'content' | 'profile' | 'networking' | 'learning' | 'special';
}

/**
 * OFFICIAL TXC MINING POLICY - PERMANENT CONFIGURATION
 * 
 * These reward amounts and cooldowns are FIXED and must not be changed
 * without proper authorization. All systems using TXC rewards must
 * reference this single source of truth.
 */
export const OFFICIAL_TXC_MINING_POLICY: Record<string, TXCReward> = {
  // DAILY ACTIVITIES (24h cooldown)
  'daily_login': {
    action: 'daily_login',
    amount: 75,
    description: 'Daily login bonus',
    cooldownMinutes: 1440, // 24h
    category: 'daily'
  },

  // CONTENT CREATION
  'post_created': {
    action: 'post_created',
    amount: 150,
    description: 'Create a post',
    cooldownMinutes: 60, // 1h
    category: 'content'
  },
  'article_posted': {
    action: 'article_posted',
    amount: 500,
    description: 'Post an article',
    cooldownMinutes: 240, // 4h
    category: 'content'
  },
  'post_liked': {
    action: 'post_liked',
    amount: 20,
    description: 'Like a post',
    cooldownMinutes: 0, // No cooldown
    category: 'content'
  },
  'comment_made': {
    action: 'comment_made',
    amount: 20,
    description: 'Comment on a post',
    cooldownMinutes: 0, // No cooldown
    category: 'content'
  },

  // PROFILE & CAREER DEVELOPMENT
  'profile_completed': {
    action: 'profile_completed',
    amount: 300,
    description: 'Complete your profile',
    cooldownMinutes: 1440, // 24h
    category: 'profile'
  },
  'resume_created': {
    action: 'resume_created',
    amount: 225,
    description: 'Create a resume',
    cooldownMinutes: 240, // 4h
    category: 'profile'
  },
  'skill_added': {
    action: 'skill_added',
    amount: 60,
    description: 'Add skills to profile',
    cooldownMinutes: 180, // 3h
    category: 'profile'
  },

  // NETWORKING & APPLICATIONS
  'connection_made': {
    action: 'connection_made',
    amount: 75,
    description: 'Connect with someone',
    cooldownMinutes: 60, // 1h
    category: 'networking'
  },
  'job_applied': {
    action: 'job_applied',
    amount: 90,
    description: 'Apply to a job',
    cooldownMinutes: 60, // 1h
    category: 'networking'
  },
  'recommendation_given': {
    action: 'recommendation_given',
    amount: 120,
    description: 'Give a recommendation',
    cooldownMinutes: 120, // 2h
    category: 'networking'
  },

  // LEARNING & FEEDBACK
  'course_completed': {
    action: 'course_completed',
    amount: 600,
    description: 'Complete a course',
    cooldownMinutes: 60, // 1h
    category: 'learning'
  },
  'feedback_given': {
    action: 'feedback_given',
    amount: 45,
    description: 'Provide feedback',
    cooldownMinutes: 60, // 1h
    category: 'learning'
  },

  // SPECIAL BONUSES
  'joining_bonus': {
    action: 'joining_bonus',
    amount: 500,
    description: 'Welcome to TalentXcel!',
    cooldownMinutes: 0, // One-time only
    category: 'special'
  },
  'referral_made': {
    action: 'referral_made',
    amount: 1000,
    description: 'Refer a friend',
    cooldownMinutes: 0, // No limit
    category: 'special'
  },
  'social_activity_bonus': {
    action: 'social_activity_bonus',
    amount: 300,
    description: 'Social activity bonus',
    cooldownMinutes: 10080, // Weekly
    category: 'special'
  }
};

/**
 * Validates that a TXC reward configuration matches the official policy
 * @param action - The action being validated
 * @param amount - The reward amount being validated
 * @param cooldown - The cooldown being validated
 * @returns boolean indicating if the configuration is valid
 */
export function validateTXCRewardPolicy(action: string, amount: number, cooldown?: number): boolean {
  const officialReward = OFFICIAL_TXC_MINING_POLICY[action];
  if (!officialReward) return false;

  return (
    officialReward.amount === amount &&
    officialReward.cooldownMinutes === (cooldown || 0)
  );
}

/**
 * Gets the official reward configuration for an action
 * @param action - The action to get the reward for
 * @returns TXCReward configuration or null if not found
 */
export function getOfficialTXCReward(action: string): TXCReward | null {
  return OFFICIAL_TXC_MINING_POLICY[action] || null;
}

/**
 * Gets all official TXC rewards
 * @returns Array of all TXC reward configurations
 */
export function getAllOfficialTXCRewards(): TXCReward[] {
  return Object.values(OFFICIAL_TXC_MINING_POLICY);
}

/**
 * Gets rewards by category
 * @param category - The category to filter by
 * @returns Array of TXC rewards in the specified category
 */
export function getTXCRewardsByCategory(category: TXCReward['category']): TXCReward[] {
  return Object.values(OFFICIAL_TXC_MINING_POLICY).filter(reward => reward.category === category);
}

/**
 * POLICY INTEGRITY CHECK
 * This function ensures the policy hasn't been tampered with
 */
export function verifyPolicyIntegrity(): boolean {
  const expectedActionCount = 16; // Total number of actions in policy
  const actualActionCount = Object.keys(OFFICIAL_TXC_MINING_POLICY).length;
  
  // Check if all required actions exist
  const requiredActions = [
    'daily_login', 'post_created', 'connection_made', 'profile_completed',
    'resume_created', 'job_applied', 'recommendation_given', 'skill_added',
    'course_completed', 'feedback_given', 'joining_bonus', 'referral_made',
    'post_liked', 'comment_made', 'article_posted', 'social_activity_bonus'
  ];
  
  const hasAllRequired = requiredActions.every(action => 
    OFFICIAL_TXC_MINING_POLICY.hasOwnProperty(action)
  );
  
  return actualActionCount === expectedActionCount && hasAllRequired;
}

// Verify policy integrity on import
if (!verifyPolicyIntegrity()) {
  console.error('🚨 TXC POLICY INTEGRITY VIOLATION DETECTED! 🚨');
  console.error('The TXC mining policy has been tampered with or is incomplete.');
  console.error('This is a critical security issue that must be addressed immediately.');
}