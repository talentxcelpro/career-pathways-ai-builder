// src/lib/social-marketing/socialAccounts.ts
// Secure OAuth 2.0 Account Management for TalentXcel Social Marketing Engine
// Invariant: Zero plaintext passwords. Only official OAuth tokens stored in encrypted vault via Edge Functions.

import type { SocialPlatform, PlatformReadiness, AccountHealth } from './types';

export interface SocialAccountConnection {
  platform: SocialPlatform;
  account_name: string;
  account_handle: string;
  avatar_url: string;
  scopes: string[];
  health: AccountHealth;
  token_expires_at: string;
  days_until_expiration: number;
  daily_quota_used: number;
  daily_quota_budget: number;
  last_published_at?: string;
  reauth_url?: string;
}

// Default initial state representing connected accounts or official OAuth connection hooks
export const DEFAULT_CONNECTED_ACCOUNTS: Record<SocialPlatform, SocialAccountConnection> = {
  YOUTUBE: {
    platform: 'YOUTUBE',
    account_name: 'TalentXcel Official',
    account_handle: '@TalentXcel',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    scopes: ['youtube.upload', 'youtube.readonly'],
    health: 'CONNECTED',
    token_expires_at: new Date(Date.now() + 45 * 86400 * 1000).toISOString(),
    days_until_expiration: 45,
    daily_quota_used: 1600,
    daily_quota_budget: 10000,
    last_published_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  INSTAGRAM: {
    platform: 'INSTAGRAM',
    account_name: 'TalentXcel Career Intelligence',
    account_handle: '@talentxcel',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    health: 'CONNECTED',
    token_expires_at: new Date(Date.now() + 58 * 86400 * 1000).toISOString(),
    days_until_expiration: 58,
    daily_quota_used: 1,
    daily_quota_budget: 50,
    last_published_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  FACEBOOK: {
    platform: 'FACEBOOK',
    account_name: 'TalentXcel Global',
    account_handle: 'TalentXcelGlobal',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    scopes: ['pages_manage_posts', 'pages_read_engagement'],
    health: 'CONNECTED',
    token_expires_at: new Date(Date.now() + 58 * 86400 * 1000).toISOString(),
    days_until_expiration: 58,
    daily_quota_used: 1,
    daily_quota_budget: 25,
    last_published_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  X: {
    platform: 'X',
    account_name: 'TalentXcel',
    account_handle: '@talentxcel',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    health: 'CONNECTED',
    token_expires_at: new Date(Date.now() + 14 * 86400 * 1000).toISOString(),
    days_until_expiration: 14,
    daily_quota_used: 3,
    daily_quota_budget: 50,
    last_published_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
};

/**
 * Returns account health and readiness for a specific platform.
 * Allows independent execution: If X token is expired, YouTube & Instagram stay READY.
 */
export async function getPlatformReadiness(platform: SocialPlatform): Promise<{
  readiness: PlatformReadiness;
  health: AccountHealth;
  reason?: string;
}> {
  const connection = DEFAULT_CONNECTED_ACCOUNTS[platform];
  if (!connection) {
    return {
      readiness: 'BLOCKED',
      health: 'ERROR',
      reason: `Platform ${platform} is not configured in TalentXcel account catalog.`,
    };
  }

  if (connection.health !== 'CONNECTED') {
    return {
      readiness: 'BLOCKED',
      health: connection.health,
      reason: `Platform ${platform} account requires re-authorization (${connection.health}).`,
    };
  }

  // Quota check
  if (connection.daily_quota_budget && connection.daily_quota_used >= connection.daily_quota_budget) {
    return {
      readiness: 'BLOCKED',
      health: 'CONNECTED',
      reason: `Platform ${platform} daily quota exceeded (${connection.daily_quota_used}/${connection.daily_quota_budget}).`,
    };
  }

  return {
    readiness: 'READY',
    health: 'CONNECTED',
  };
}

/**
 * Generates official OAuth 2.0 authorization redirect URL for an admin connecting a platform
 */
export function getOAuthConnectUrl(platform: SocialPlatform): string {
  const redirectUri = encodeURIComponent(`${window?.location?.origin || 'https://talentxcel.in'}/admin/oauth/callback`);
  switch (platform) {
    case 'YOUTUBE':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=talentxcel-yt-client&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent`;
    case 'INSTAGRAM':
    case 'FACEBOOK':
      return `https://www.facebook.com/v20.0/dialog/oauth?client_id=talentxcel-meta-client&redirect_uri=${redirectUri}&scope=pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code`;
    case 'X':
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=talentxcel-x-client&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state_txc&code_challenge=challenge&code_challenge_method=plain`;
  }
}
