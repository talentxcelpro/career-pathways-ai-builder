// src/agents/core/ChannelRegistry.ts
// Production Channel Registry & Connector Health Monitor
// Tracks connection status, rate limits, budgets, and security across all 14 channels.

import type { ChannelDescriptor, ChannelStatus } from './types';

export class ChannelRegistry {
  private channels = new Map<string, ChannelDescriptor>();

  constructor() {
    this.registerDefaultChannels();
  }

  private registerDefaultChannels() {
    const descriptors: ChannelDescriptor[] = [
      {
        id: 'email_ses',
        name: 'AWS SES Email',
        category: 'direct_outreach',
        status: 'ACTIVE',
        statusDetails: 'AWS SES template pipeline configured with email_automation_queue fallback.',
        rateLimitPerHour: 100,
        dailyBudgetCapINR: 5000,
        requiresFounderApproval: false,
        requiredSecrets: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SES_FROM_EMAIL'],
        missingSecrets: [],
        allowedAgents: ['email_growth', 'employer_outreach', 'outbid_reclaim', 'college_partnership'],
      },
      {
        id: 'google_seo',
        name: 'Google Organic Search & Sitemaps',
        category: 'search',
        status: 'ACTIVE',
        statusDetails: '30,853 sitemap entries, robots.txt, and Schema.org active in production.',
        rateLimitPerHour: 1000,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: false,
        requiredSecrets: [],
        missingSecrets: [],
        allowedAgents: ['seo', 'job_seo', 'content'],
      },
      {
        id: 'ai_geo_search',
        name: 'AI / GEO Search (ChatGPT, Perplexity, Claude)',
        category: 'search',
        status: 'ACTIVE',
        statusDetails: 'llms.txt, llms-full.txt, semantic HTML, and structured entity directories active.',
        rateLimitPerHour: 5000,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: false,
        requiredSecrets: [],
        missingSecrets: [],
        allowedAgents: ['geo_ai_search', 'content', 'growth'],
      },
      {
        id: 'razorpay',
        name: 'Razorpay Payments & Checkout',
        category: 'payment',
        status: 'ACTIVE',
        statusDetails: 'Razorpay order creation & signature verification active with demo fallback.',
        rateLimitPerHour: 500,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: true,
        requiredSecrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
        missingSecrets: [],
        allowedAgents: ['billing', 'revenue', 'claim_acquisition'],
      },
      {
        id: 'in_product',
        name: 'TalentXcel In-Product & Feed Engine',
        category: 'internal',
        status: 'ACTIVE',
        statusDetails: 'Internal network feed, notifications table, and live banners active.',
        rateLimitPerHour: 500,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: false,
        requiredSecrets: [],
        missingSecrets: [],
        allowedAgents: ['social_distribution', 'candidate_retention', 'claim_marketing'],
      },
      {
        id: 'referrals',
        name: 'Referral & Token Attribution Engine',
        category: 'internal',
        status: 'ACTIVE',
        statusDetails: 'On-platform referral links and token bonus distribution.',
        rateLimitPerHour: 500,
        dailyBudgetCapINR: 10000,
        requiresFounderApproval: false,
        requiredSecrets: [],
        missingSecrets: [],
        allowedAgents: ['growth', 'candidate_acquisition', 'revenue'],
      },
      {
        id: 'whatsapp_cloud',
        name: 'WhatsApp Business Cloud API',
        category: 'direct_outreach',
        status: 'BLOCKED',
        statusDetails: 'Meta WhatsApp Cloud API connector waiting for credentials in Supabase Vault.',
        rateLimitPerHour: 50,
        dailyBudgetCapINR: 5000,
        requiresFounderApproval: true,
        requiredSecrets: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
        missingSecrets: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
        allowedAgents: ['employer_outreach', 'outbid_reclaim'],
      },
      {
        id: 'telegram_bot',
        name: 'Telegram Community Bot API',
        category: 'community',
        status: 'BLOCKED',
        statusDetails: 'Telegram Bot API token required for automated alerts and channel broadcast.',
        rateLimitPerHour: 100,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: false,
        requiredSecrets: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
        missingSecrets: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
        allowedAgents: ['social_distribution', 'job_discovery'],
      },
      {
        id: 'linkedin',
        name: 'LinkedIn Official Marketing API',
        category: 'social',
        status: 'MANUAL_REQUIRED',
        statusDetails: 'Marked as Human/Manual channel until official LinkedIn Marketing OAuth app is connected.',
        rateLimitPerHour: 20,
        dailyBudgetCapINR: 10000,
        requiresFounderApproval: true,
        requiredSecrets: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
        missingSecrets: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
        allowedAgents: ['social_distribution', 'employer_outreach'],
      },
      {
        id: 'x_twitter',
        name: 'X (Twitter) Developer API v2',
        category: 'social',
        status: 'MANUAL_REQUIRED',
        statusDetails: 'Marked as Human/Manual channel until X API tokens are provided.',
        rateLimitPerHour: 30,
        dailyBudgetCapINR: 5000,
        requiresFounderApproval: true,
        requiredSecrets: ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN'],
        missingSecrets: ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN'],
        allowedAgents: ['social_distribution', 'claim_marketing'],
      },
      {
        id: 'meta_instagram_fb',
        name: 'Meta Graph API (Instagram & Facebook)',
        category: 'social',
        status: 'BLOCKED',
        statusDetails: 'Meta Graph API access token required.',
        rateLimitPerHour: 30,
        dailyBudgetCapINR: 5000,
        requiresFounderApproval: true,
        requiredSecrets: ['META_PAGE_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID'],
        missingSecrets: ['META_PAGE_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID'],
        allowedAgents: ['social_distribution', 'content'],
      },
      {
        id: 'youtube',
        name: 'YouTube Data API v3 Pipeline',
        category: 'social',
        status: 'MANUAL_REQUIRED',
        statusDetails: 'Video topic & script generation active in Content Agent; publishing requires OAuth.',
        rateLimitPerHour: 5,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: true,
        requiredSecrets: ['YOUTUBE_API_KEY'],
        missingSecrets: ['YOUTUBE_API_KEY'],
        allowedAgents: ['content'],
      },
      {
        id: 'reddit',
        name: 'Reddit Community Intelligence',
        category: 'community',
        status: 'ACTIVE',
        statusDetails: 'Strict read-only market intelligence and trending topic monitoring mode (Zero spam policy).',
        rateLimitPerHour: 60,
        dailyBudgetCapINR: 0,
        requiresFounderApproval: true,
        requiredSecrets: [],
        missingSecrets: [],
        allowedAgents: ['content', 'strategy', 'growth'],
      },
      {
        id: 'college_partnerships',
        name: 'Direct College Placement Cells (1,509 Institutions)',
        category: 'direct_outreach',
        status: 'ACTIVE',
        statusDetails: 'Direct institutional database catalog and placement officer outreach pipeline.',
        rateLimitPerHour: 50,
        dailyBudgetCapINR: 5000,
        requiresFounderApproval: true,
        requiredSecrets: [],
        missingSecrets: [],
        allowedAgents: ['college_discovery', 'college_partnership'],
      },
    ];

    for (const d of descriptors) {
      this.channels.set(d.id, d);
    }
  }

  getChannel(id: string): ChannelDescriptor | undefined {
    return this.channels.get(id);
  }

  getAllChannels(): ChannelDescriptor[] {
    return Array.from(this.channels.values());
  }

  updateChannelStatus(id: string, status: ChannelStatus, details?: string) {
    const ch = this.channels.get(id);
    if (ch) {
      ch.status = status;
      if (details) ch.statusDetails = details;
    }
  }

  canAgentUseChannel(agentId: string, channelId: string): boolean {
    const ch = this.channels.get(channelId);
    if (!ch) return false;
    if (ch.status === 'BLOCKED' || ch.status === 'DISABLED') return false;
    return ch.allowedAgents.includes(agentId) || ch.allowedAgents.includes('*');
  }
}

export const coreChannelRegistry = new ChannelRegistry();
